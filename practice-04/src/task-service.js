const PRIORITIES = new Set(["low", "medium", "high"]);

function checkId(id) {
  return Number.isSafeInteger(id) && id > 0
    ? { ok: true }
    : { ok: false, error: "id должен быть положительным безопасным целым числом" };
}

function checkTitle(title) {
  if (typeof title !== "string") return { ok: false, error: "Название должно быть строкой" };
  const value = title.trim();
  return value.length >= 1 && value.length <= 100
    ? { ok: true, value }
    : { ok: false, error: "Длина названия должна быть от 1 до 100 символов" };
}

export function createTask(id, title, priority = "medium") {
  const idResult = checkId(id);
  if (!idResult.ok) return idResult;
  const titleResult = checkTitle(title);
  if (!titleResult.ok) return titleResult;
  if (!PRIORITIES.has(priority)) return { ok: false, error: "Приоритет должен быть low, medium или high" };
  return { ok: true, task: { id, title: titleResult.value, completed: false, priority } };
}

export function findTaskById(tasks, id) { return tasks.find((task) => task.id === id); }
export function getPendingTasks(tasks) { return tasks.filter((task) => !task.completed); }
export function getTaskTitles(tasks) { return tasks.map((task) => task.title); }

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  return { total, completed, pending: total - completed, progress: total ? (completed / total) * 100 : 0 };
}

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) return created;
  if (findTaskById(tasks, id)) return { ok: false, error: `Задача с id ${id} уже существует` };
  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idResult = checkId(id);
  if (!idResult.ok) return idResult;
  if (typeof completed !== "boolean") return { ok: false, error: "completed должен быть true или false" };
  if (!findTaskById(tasks, id)) return { ok: false, error: `Задача с id ${id} не найдена` };
  return { ok: true, tasks: tasks.map((task) => task.id === id ? { ...task, completed } : task) };
}

export function renameTask(tasks, id, title) {
  const titleResult = checkTitle(title);
  if (!titleResult.ok) return titleResult;
  if (!checkId(id).ok) return checkId(id);
  if (!findTaskById(tasks, id)) return { ok: false, error: `Задача с id ${id} не найдена` };
  return { ok: true, tasks: tasks.map((task) => task.id === id ? { ...task, title: titleResult.value } : task) };
}

export function removeTask(tasks, id) {
  const idResult = checkId(id);
  if (!idResult.ok) return idResult;
  if (!findTaskById(tasks, id)) return { ok: false, error: `Задача с id ${id} не найдена` };
  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}

export function updateTask(tasks, id, title, priority) {
  const idResult = checkId(id);
  if (!idResult.ok) return idResult;
  if (!findTaskById(tasks, id)) return { ok: false, error: `Задача с id ${id} не найдена` };
  const titleResult = checkTitle(title);
  if (!titleResult.ok) return titleResult;
  if (!PRIORITIES.has(priority)) return { ok: false, error: "Приоритет должен быть low, medium или high" };
  return { ok: true, tasks: tasks.map((task) => task.id === id ? { ...task, title: titleResult.value, priority } : task) };
}
