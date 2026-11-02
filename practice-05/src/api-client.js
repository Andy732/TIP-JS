export class ApiError extends Error {
  constructor(message, { kind, status = null, code = null, details = null, url = null, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

export function buildUrl(baseUrl, path, query = {}) {
  const base = String(baseUrl).replace(/\/+$/, "");
  const pathname = String(path).replace(/^\/+/, "");
  const url = new URL(`${base}/${pathname}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.href;
}

export function createApiClient({ baseUrl, fetchFn = globalThis.fetch, timeoutMs = 2000 } = {}) {
  let base;
  try {
    base = new URL(baseUrl);
  } catch { throw new TypeError("baseUrl должен быть абсолютным HTTP(S) URL"); }
  if (!["http:", "https:"].includes(base.protocol) || base.search || base.hash) throw new TypeError("baseUrl должен быть HTTP(S) URL без query и hash");
  if (typeof fetchFn !== "function") throw new TypeError("fetchFn должен быть функцией");
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new TypeError("timeoutMs должен быть положительным целым числом");
  const normalizedBase = base.href.replace(/\/+$/, "");

  async function requestJson(path, { query = {}, signal, timeoutMs: requestTimeout = timeoutMs } = {}) {
    if (!Number.isSafeInteger(requestTimeout) || requestTimeout <= 0) throw new TypeError("timeoutMs должен быть положительным целым числом");
    const url = buildUrl(normalizedBase, path, query);
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, requestTimeout);
    const forwardAbort = () => controller.abort(signal?.reason);
    if (signal?.aborted) forwardAbort();
    else signal?.addEventListener("abort", forwardAbort, { once: true });
    try {
      let response;
      try {
        response = await fetchFn(url, { method: "GET", headers: { Accept: "application/json" }, signal: controller.signal });
      } catch (cause) {
        if (timedOut) throw new ApiError("Время ожидания ответа API истекло", { kind: "timeout", url, cause });
        if (signal?.aborted) throw new ApiError("Запрос отменён", { kind: "aborted", url, cause });
        throw new ApiError("Не удалось связаться с API", { kind: "network", url, cause });
      }
      if (!response || typeof response.ok !== "boolean" || typeof response.status !== "number") {
        throw new ApiError("API вернул некорректный HTTP-ответ", { kind: "invalid-response", url });
      }
      if (!response.ok) {
        let payload;
        try { payload = await response.json(); } catch { payload = null; }
        const body = payload?.error;
        throw new ApiError(body?.message || `HTTP ${response.status}`, {
          kind: "http", status: response.status, code: body?.code ?? null,
          details: body?.details ?? null, url,
        });
      }
      if (response.status === 204) return null;
      const contentType = response.headers?.get?.("content-type") ?? "";
      if (!/\bapplication\/json\b/i.test(contentType)) throw new ApiError("API вернул ответ не в формате JSON", { kind: "invalid-response", status: response.status, url });
      try { return await response.json(); }
      catch (cause) { throw new ApiError("Не удалось разобрать JSON ответа API", { kind: "invalid-response", status: response.status, url, cause }); }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forwardAbort);
    }
  }
  return { requestJson };
}
