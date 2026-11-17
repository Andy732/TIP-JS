// Чистые функции: без React, DOM, сети, случайных значений и изменения аргументов.
// Точные контракты и допустимые входы приведены в методичке.
export function validateTaskDraft(draft, categories) {
  const value = { title: typeof draft?.title === 'string' ? draft.title.trim() : '',
    priority: draft?.priority, categoryId: Number(draft?.categoryId) };
  const errors = {};
  if (!value.title || value.title.length > 100) errors.title = 'Название: от 1 до 100 символов.';
  if (!['low', 'medium', 'high'].includes(value.priority)) errors.priority = 'Выберите приоритет.';
  if (!Number.isSafeInteger(value.categoryId) || !categories.some(c => c.id === value.categoryId)) errors.categoryId = 'Выберите категорию.';
  return { valid: Object.keys(errors).length === 0, value, errors };
}
export function selectTasks(tasks, filters) {
  const query = filters.q.trim().toLocaleLowerCase('ru-RU');
  return tasks.filter(task => task.title.toLocaleLowerCase('ru-RU').includes(query)
    && (filters.completed === '' || task.completed === (filters.completed === 'true'))
    && (filters.priority === '' || task.priority === filters.priority)
    && (filters.categoryId === '' || task.categoryId === Number(filters.categoryId)));
}
export function getTaskStats(tasks) {
  const completed = tasks.filter(task => task.completed).length;
  return { total: tasks.length, completed, active: tasks.length - completed };
}
export function addTask(tasks, value, id) {
  if (!Number.isSafeInteger(id) || id <= 0 || tasks.some(task => task.id === id)) throw new RangeError('Некорректный id.');
  return [...tasks, { id, ...value, completed: false }];
}
export function updateTask(tasks, id, value) {
  if (!tasks.some(task => task.id === id)) return tasks;
  return tasks.map(task => task.id === id ? { ...task, title: value.title, priority: value.priority, categoryId: value.categoryId } : task);
}
export function toggleTask(tasks, id) {
  if (!tasks.some(task => task.id === id)) return tasks;
  return tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
}
export function removeTask(tasks, id) {
  if (!tasks.some(task => task.id === id)) return tasks;
  return tasks.filter(task => task.id !== id);
}
