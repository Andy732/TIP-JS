export const STORAGE_VERSION = 1;

const PRIORITIES = new Set(["low", "medium", "high"]);
const copy = (tasks) => tasks.map((task) => ({ ...task }));

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (!task || typeof task !== "object" || !Number.isSafeInteger(task.id) || task.id <= 0
      || typeof task.title !== "string" || task.title.trim().length < 1 || task.title.trim().length > 100
      || typeof task.completed !== "boolean" || !PRIORITIES.has(task.priority) || ids.has(task.id)) return false;
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = () => copy(fallbackTasks);
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: fallback() };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION || !isValidTaskList(parsed.tasks)) {
      throw new Error("Схема данных или версия хранилища не поддерживается");
    }
    return { ok: true, source: "storage", tasks: copy(parsed.tasks) };
  } catch (error) {
    return { ok: false, source: "fallback", tasks: fallback(), error: `Не удалось восстановить данные: ${error.message}` };
  }
}

export function saveTasks(storage, key, tasks) {
  try {
    if (!isValidTaskList(tasks)) throw new Error("Список задач имеет неверный формат");
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось сохранить данные: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try { storage.removeItem(key); return { ok: true }; }
  catch (error) { return { ok: false, error: `Не удалось сбросить данные: ${error.message}` }; }
}
