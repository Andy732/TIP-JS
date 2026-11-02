import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  const requiredApi = ["loadInitialData", "getTasks", "createTask", "updateTask", "setTaskCompleted", "deleteTask", "resetDemoData"];
  if (!api || requiredApi.some((name) => typeof api[name] !== "function") || !view
    || ["setListState", "setTasks", "setCategories", "setTotal", "setFormTask", "showFormErrors", "setMutationPending", "notify"].some((name) => typeof view[name] !== "function")
    || typeof validateDraft !== "function") throw new TypeError("Для контроллера нужны API, view и валидатор с ожидаемыми методами");

  let tasks = [];
  let categories = [];
  let filters = {};
  let editingId = null;
  let categoriesLoaded = false;
  let activeLoad = null;
  let loadVersion = 0;
  let destroyed = false;

  async function load(nextFilters = filters, initial = !categoriesLoaded) {
    filters = { ...nextFilters };
    activeLoad?.abort();
    const controller = new AbortController();
    activeLoad = controller;
    const version = ++loadVersion;
    view.setListState("loading");
    try {
      const result = initial
        ? await api.loadInitialData(filters, { signal: controller.signal })
        : await api.getTasks(filters, { signal: controller.signal });
      if (destroyed || version !== loadVersion) return;
      tasks = result.tasks;
      if (initial) { categories = result.categories; categoriesLoaded = true; view.setCategories(categories); }
      view.setTasks(tasks, categories);
      const total = result.meta?.total ?? tasks.length;
      view.setTotal(total);
      view.setListState(tasks.length ? "ready" : "empty");
    } catch (error) {
      if (destroyed || version !== loadVersion || error instanceof ApiError && error.kind === "aborted") return;
      view.setListState("error", messageForError(error));
    } finally {
      if (version === loadVersion) activeLoad = null;
    }
  }

  async function start(initialFilters = {}) {
    categoriesLoaded = false;
    return load(initialFilters, true);
  }
  async function applyFilters(nextFilters = {}) { return load(nextFilters, !categoriesLoaded); }
  async function refresh() { return load(filters, !categoriesLoaded); }

  function beginEdit(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) { view.notify("Задача не найдена в текущем списке.", "error"); return false; }
    editingId = id;
    view.showFormErrors({});
    view.setFormTask(task);
    return true;
  }
  function cancelEdit() { editingId = null; view.showFormErrors({}); view.setFormTask(null); }

  async function mutate(action, successMessage) {
    view.setMutationPending(true);
    view.notify("");
    try {
      await action();
      editingId = null;
      view.showFormErrors({});
      view.setFormTask(null);
      await load(filters, false);
      view.notify(successMessage, "success");
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally { view.setMutationPending(false); }
  }

  async function submit(draft) {
    const checked = validateDraft(draft, categories);
    if (!checked.valid) { view.showFormErrors(checked.errors); return; }
    const value = checked.value;
    if (editingId === null) {
      await mutate(() => api.createTask(value), "Задача добавлена.");
    } else {
      const id = editingId;
      await mutate(() => api.updateTask(id, value), "Изменения сохранены.");
    }
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) { view.notify("Задача не найдена в текущем списке.", "error"); return; }
    await mutate(() => api.setTaskCompleted(id, !task.completed), "Статус задачи изменён.");
  }
  async function deleteTask(id) { await mutate(() => api.deleteTask(id), "Задача удалена."); }
  async function resetData() { await mutate(() => api.resetDemoData(), "Учебные данные восстановлены."); }

  function destroy() { destroyed = true; loadVersion += 1; activeLoad?.abort(); activeLoad = null; }

  return { start, applyFilters, refresh, submit, beginEdit, cancelEdit, toggleTask, deleteTask, resetData, destroy };
}
