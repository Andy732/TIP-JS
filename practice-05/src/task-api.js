import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);
function invalidResponse(message) { return new ApiError(message, { kind: "invalid-response" }); }
function isPositiveSafeInteger(value) { return Number.isSafeInteger(value) && value > 0; }
function isTask(value) {
  return Boolean(value && typeof value === "object" && isPositiveSafeInteger(value.id)
    && typeof value.title === "string" && value.title.trim().length >= 1 && value.title.trim().length <= 100
    && typeof value.completed === "boolean" && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId));
}
function isCategory(value) {
  return Boolean(value && typeof value === "object" && isPositiveSafeInteger(value.id)
    && typeof value.name === "string" && value.name.trim().length >= 1 && value.name.trim().length <= 100);
}
function requirePayload(condition, message) { if (!condition) throw invalidResponse(message); }
function validateTaskCollection(payload) {
  requirePayload(payload && Array.isArray(payload.data), "API вернул неверный список задач");
  const ids = new Set();
  for (const task of payload.data) {
    requirePayload(isTask(task) && !ids.has(task.id), "API вернул задачу неверной формы или повторяющийся id");
    ids.add(task.id);
  }
  requirePayload(payload.meta && Number.isSafeInteger(payload.meta.total) && payload.meta.total === payload.data.length,
    "API вернул неверное количество задач");
  return { tasks: payload.data, meta: payload.meta };
}
function validateCategoryCollection(payload) {
  requirePayload(payload && Array.isArray(payload.data), "API вернул неверный список категорий");
  const ids = new Set();
  for (const category of payload.data) {
    requirePayload(isCategory(category) && !ids.has(category.id), "API вернул категорию неверной формы или повторяющийся id");
    ids.add(category.id);
  }
  requirePayload(payload.meta && Number.isSafeInteger(payload.meta.total) && payload.meta.total === payload.data.length,
    "API вернул неверное количество категорий");
  return payload.data;
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") throw new TypeError("Ожидается клиент с методом requestJson");

  function normalizeFilters(filters = {}) {
    if (!filters || typeof filters !== "object" || Array.isArray(filters)) throw new TypeError("Фильтры должны быть объектом");
    for (const key of Object.keys(filters)) if (!ALLOWED_FILTERS.has(key)) throw new TypeError(`Неизвестный фильтр: ${key}`);
    const result = {};
    if (Object.hasOwn(filters, "completed")) {
      if (typeof filters.completed !== "boolean") throw new TypeError("completed должен быть boolean");
      result.completed = filters.completed;
    }
    if (Object.hasOwn(filters, "priority")) {
      if (!ALLOWED_PRIORITIES.has(filters.priority)) throw new TypeError("Недопустимый priority");
      result.priority = filters.priority;
    }
    if (Object.hasOwn(filters, "categoryId")) {
      if (!isPositiveSafeInteger(filters.categoryId)) throw new TypeError("categoryId должен быть положительным целым числом");
      result.categoryId = filters.categoryId;
    }
    if (Object.hasOwn(filters, "q")) {
      if (typeof filters.q !== "string" || filters.q.trim().length > 100) throw new TypeError("q должен быть строкой длиной до 100 символов");
      if (filters.q.trim()) result.q = filters.q.trim();
    }
    return result;
  }

  async function getTasks(filters = {}, options) {
    const query = normalizeFilters(filters);
    return validateTaskCollection(await client.requestJson("/tasks", { query, ...options }));
  }
  async function getTaskById(id, options) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть положительным безопасным целым числом");
    const payload = await client.requestJson(`/tasks/${id}`, options);
    requirePayload(payload && isTask(payload.data), "API вернул задачу неверной формы");
    return payload.data;
  }
  async function getCategories(options) {
    return validateCategoryCollection(await client.requestJson("/categories", options));
  }
  async function loadInitialData(filters = {}, options) {
    const normalized = normalizeFilters(filters);
    const [taskResult, categories] = await Promise.all([
      getTasks(normalized, options), getCategories(options),
    ]);
    return { ...taskResult, categories };
  }
  return { getTasks, getTaskById, getCategories, loadInitialData };
}
