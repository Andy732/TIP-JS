import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);
function invalidResponse(message) { return new ApiError(message, { kind: "invalid-response" }); }
function isPositiveSafeInteger(value) { return Number.isSafeInteger(value) && value > 0; }
export function isTask(value) {
  return Boolean(value && typeof value === "object" && isPositiveSafeInteger(value.id)
    && typeof value.title === "string" && value.title.trim().length >= 1 && value.title.trim().length <= 100
    && typeof value.completed === "boolean" && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId));
}
export function isCategory(value) {
  return Boolean(value && typeof value === "object" && isPositiveSafeInteger(value.id)
    && typeof value.name === "string" && value.name.trim().length >= 1 && value.name.trim().length <= 100);
}
function ensure(ok, message) { if (!ok) throw invalidResponse(message); }
function taskCollection(payload) {
  ensure(payload && Array.isArray(payload.data), "API вернул неверный список задач");
  const ids = new Set();
  for (const task of payload.data) { ensure(isTask(task) && !ids.has(task.id), "Задача имеет неверную форму или повторяющийся id"); ids.add(task.id); }
  ensure(payload.meta && payload.meta.total === payload.data.length, "API вернул неверное количество задач");
  return { tasks: payload.data, meta: payload.meta };
}
function categoryCollection(payload) {
  ensure(payload && Array.isArray(payload.data), "API вернул неверный список категорий");
  const ids = new Set();
  for (const category of payload.data) { ensure(isCategory(category) && !ids.has(category.id), "Категория имеет неверную форму или повторяющийся id"); ids.add(category.id); }
  ensure(payload.meta && payload.meta.total === payload.data.length, "API вернул неверное количество категорий");
  return payload.data;
}
function validateId(id) { if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть положительным безопасным целым числом"); }

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") throw new TypeError("Ожидается клиент с методом requestJson");
  function normalizeFilters(filters = {}) {
    if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Фильтры должны быть объектом");
    for (const key of Object.keys(filters)) if (!ALLOWED_FILTERS.has(key)) throw new TypeError(`Неизвестный фильтр: ${key}`);
    const result = {};
    if (Object.hasOwn(filters, "completed")) { if (typeof filters.completed !== "boolean") throw new TypeError("completed должен быть boolean"); result.completed = filters.completed; }
    if (Object.hasOwn(filters, "priority")) { if (!ALLOWED_PRIORITIES.has(filters.priority)) throw new TypeError("Недопустимый priority"); result.priority = filters.priority; }
    if (Object.hasOwn(filters, "categoryId")) { if (!isPositiveSafeInteger(filters.categoryId)) throw new TypeError("categoryId должен быть положительным целым числом"); result.categoryId = filters.categoryId; }
    if (Object.hasOwn(filters, "q")) { if (typeof filters.q !== "string" || filters.q.trim().length > 100) throw new TypeError("q должен быть строкой длиной до 100 символов"); if (filters.q.trim()) result.q = filters.q.trim(); }
    return result;
  }
  async function getTasks(filters = {}, options) { return taskCollection(await client.requestJson("/tasks", { query: normalizeFilters(filters), ...options })); }
  async function getTaskById(id, options) { validateId(id); const payload = await client.requestJson(`/tasks/${id}`, options); ensure(payload && isTask(payload.data), "API вернул задачу неверной формы"); return payload.data; }
  async function getCategories(options) { return categoryCollection(await client.requestJson("/categories", options)); }
  async function loadInitialData(filters = {}, options) {
    const normalized = normalizeFilters(filters);
    const [result, categories] = await Promise.all([getTasks(normalized, options), getCategories(options)]);
    return { ...result, categories };
  }
  async function createTask(draft, options) {
    const payload = await client.requestJson("/tasks", { ...options, method: "POST", body: draft });
    ensure(payload && isTask(payload.data), "API вернул созданную задачу неверной формы");
    return payload.data;
  }
  async function updateTask(id, changes, options) {
    validateId(id);
    const payload = await client.requestJson(`/tasks/${id}`, { ...options, method: "PATCH", body: changes });
    ensure(payload && isTask(payload.data) && payload.data.id === id, "API вернул изменённую задачу неверной формы");
    return payload.data;
  }
  async function setTaskCompleted(id, completed, options) {
    if (typeof completed !== "boolean") throw new TypeError("completed должен быть boolean");
    return updateTask(id, { completed }, options);
  }
  async function deleteTask(id, options) {
    validateId(id);
    const result = await client.requestJson(`/tasks/${id}`, { ...options, method: "DELETE" });
    ensure(result === null, "API должен вернуть пустой ответ 204 после удаления");
    return null;
  }
  async function resetDemoData(options) {
    const payload = await client.requestJson("/debug/reset", { ...options, method: "POST" });
    ensure(payload && payload.data && payload.data.reset === true && Number.isSafeInteger(payload.data.total), "API не подтвердил сброс данных");
    return payload.data;
  }
  return { getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask, setTaskCompleted, deleteTask, resetDemoData };
}
