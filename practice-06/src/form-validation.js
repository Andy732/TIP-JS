const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  const errors = {};
  const title = draft?.title;
  if (typeof title !== "string" || title.trim().length < 1 || title.trim().length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов";
  }
  if (!ALLOWED_PRIORITIES.has(draft?.priority)) errors.priority = "Выберите допустимый приоритет";
  const categoryId = Number(draft?.categoryId);
  if (!Number.isSafeInteger(categoryId) || categoryId <= 0 || !categories.some((category) => category.id === categoryId)) {
    errors.categoryId = "Выберите существующую категорию";
  }
  if (Object.keys(errors).length) return { valid: false, value: null, errors };
  return { valid: true, value: { title: title.trim(), priority: draft.priority, categoryId }, errors };
}
