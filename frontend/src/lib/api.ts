/**
 * Minimal JSON client for our API. The browser always calls same-origin `/api/...` (Next
 * rewrites it to the Express server), so cookies are first-party and no CORS is involved.
 *
 * Every failure becomes an `ApiError` with a stable `code`, so UI code never inspects raw
 * responses. Error body contract (backend `lib/errors.ts`): `{ error: { code, message, fields? } }`.
 */

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "BAD_RESPONSE"
  | "UNKNOWN"
  | (string & {});

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fields: Record<string, string> | undefined;
  /** Seconds to wait before retrying (from `Retry-After` on 429). */
  readonly retryAfter: number | undefined;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    extra: { fields?: Record<string, string>; retryAfter?: number } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = extra.fields;
    this.retryAfter = extra.retryAfter;
  }
}

/** Allow for a slow serverless cold start (a few seconds) with a wide margin, then give up. */
export const REQUEST_TIMEOUT_MS = 70_000;

type ErrorBody = { error?: { code?: string; message?: string; fields?: Record<string, string> } };

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : undefined;
}

async function request<T>(path: string, init: RequestInit, timeoutMs: number): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { Accept: "application/json", ...init.headers },
      credentials: "same-origin",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(0, "TIMEOUT", "The server took too long to respond.");
    }
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server.");
  }

  // 204 No Content (logout) is a success without a body.
  if (response.status === 204) return undefined as T;

  const isJson = response.headers.get("Content-Type")?.includes("application/json") ?? false;
  const data: unknown = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const error = (data as ErrorBody | undefined)?.error;
    throw new ApiError(response.status, error?.code ?? "UNKNOWN", error?.message ?? response.statusText, {
      fields: error?.fields,
      retryAfter: parseRetryAfter(response.headers.get("Retry-After")),
    });
  }
  // A "successful" response that isn't our JSON — e.g. a host's HTML error or loading page
  // coming back through the /api rewrite. Never treat it as success.
  if (data === undefined) {
    throw new ApiError(response.status, "BAD_RESPONSE", "The server sent an unexpected response.");
  }
  return data as T;
}

export function getJson<T>(path: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return request<T>(path, { method: "GET" }, timeoutMs);
}

export function postJson<T>(path: string, body: unknown, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return request<T>(
    path,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    timeoutMs,
  );
}
