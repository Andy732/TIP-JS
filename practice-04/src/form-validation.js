const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const id = editingId === null ? Number(draft?.id) : editingId;
  if (!Number.isSafeInteger(id) || id <= 0) errors.id = "id должен быть положительным целым числом";
  else if (editingId === null && tasks.some((task) => task.id === id)) errors.id = `Задача с id ${id} уже существует`;
  else if (editingId !== null && !tasks.some((task) => task.id === editingId)) errors.id = `Задача с id ${editingId} не найдена`;

  if (typeof draft?.title !== "string" || draft.title.trim().length < 1 || draft.title.trim().length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов";
  }
  if (!ALLOWED_PRIORITIES.has(draft?.priority)) errors.priority = "Выберите допустимый приоритет";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { id, title: draft.title.trim(), priority: draft.priority } };
}
