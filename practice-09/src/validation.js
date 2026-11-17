import { ApiError } from './errors.js';

// raw: строка; результат: безопасное положительное целое либо null.
export function parsePositiveId(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

// URLSearchParams -> { completed: boolean|null, priority: string|null,
// categoryId: number|null, q: string }. Ошибка: ApiError(400, 'INVALID_QUERY', ...).
// Неизвестные и повторяющиеся параметры запрещены. Правила — в методичке.
export function parseFilters(searchParams) {
  const allowed = new Set(['completed', 'priority', 'categoryId', 'q']);
  for (const key of searchParams.keys()) {
    if (!allowed.has(key) || searchParams.getAll(key).length !== 1) {
      throw new ApiError(400, 'INVALID_QUERY', 'Неизвестный или повторяющийся параметр.');
    }
  }
  const completed = searchParams.get('completed');
  const priority = searchParams.get('priority');
  const category = searchParams.get('categoryId');
  const q = (searchParams.get('q') ?? '').trim();
  if ((completed !== null && !['true', 'false'].includes(completed))
      || (priority !== null && !['low', 'medium', 'high'].includes(priority))
      || (category !== null && parsePositiveId(category) === null)
      || q.length > 100) {
    throw new ApiError(400, 'INVALID_QUERY', 'Некорректное значение параметра.');
  }
  return { completed: completed === null ? null : completed === 'true', priority,
    categoryId: category === null ? null : parsePositiveId(category), q };
}
