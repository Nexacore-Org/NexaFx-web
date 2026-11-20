import { getAccessToken, refreshAccessToken } from "./auth";
export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | string[]>;
  headers?: Record<string, string>;
  /**
   * When true, a 401 response will not trigger a token refresh or the
   * unauthorized handler (and therefore no logout). Use for requests where a
   * 401 is an expected, user-facing outcome (e.g. wrong password or TOTP).
   */
  skipAuthRefresh?: boolean;
}

export interface ApiErrorInit {
  status: number | null;
  code: string | null;
  message: string;
  details: unknown | null;
  isNetworkError: boolean;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip attaching the Authorization header (used by auth endpoints). */
  skipAuth?: boolean;
  /** Skip the automatic refresh-and-retry on 401. */
  skipRefresh?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}${path}`;
}

function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return /\bapplication\/(?:[\w.+-]+\+)?json\b/i.test(contentType);
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204 || res.status === 205) return undefined;
async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      // Route handlers may respond with `{ code, message }` or the legacy
      // `{ error }` shape. Prefer `message`, then fall back to `error`.
      const message =
        typeof data?.message === "string"
          ? data.message
          : typeof data?.error === "string"
            ? data.error
            : `Request failed with status ${res.status}`;
      throw new ApiError({
        status: res.status,
        code: data?.code ?? null,
        message,
        details: data ?? null,
        isNetworkError: false,
      });
    }
    return data as T;
  }

  const text = await res.text();
  if (text.length === 0) return undefined;

  if (!isJsonContentType(res.headers.get("content-type"))) {
    throw new ApiError("Unexpected non-JSON response", res.status, text);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("Failed to parse JSON response", res.status, text);
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
  { method = "GET", body, query, headers, skipAuthRefresh }: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, skipRefresh, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && !skipRefresh && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipRefresh: true });
  try {
    const options: RequestOptions = { method, body, headers };
    let res = await execute(url.toString(), options);

    // On 401, give the auth layer a chance to refresh and retry once.
    // Requests that opt out (e.g. wrong password / TOTP) must not refresh or
    // trigger logout — the 401 is surfaced to the caller as an ApiError.
    if (res.status === 401 && !skipAuthRefresh && unauthorizedHandler) {
      const recovered = await unauthorizedHandler(path);
      if (recovered) {
        res = await execute(url.toString(), options);
      }
    }

    return await parseResponse<T>(res);
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;

    // `AbortSignal.timeout` rejects with a DOMException named `TimeoutError`.
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new ApiError({
        status: 0,
        code: "REQUEST_TIMEOUT",
        message: "Request timed out",
        details: null,
        isNetworkError: true,
      });
    }
  }

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await parseBody(res);
    } catch {
      errorBody = undefined;
    }
    const message =
      (errorBody as { message?: string } | undefined)?.message ??
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, errorBody);
    // Caller-initiated abort (e.g. component unmount) is not a timeout.
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError({
        status: 0,
        code: "REQUEST_ABORTED",
        message: "Request was aborted",
        details: null,
        isNetworkError: false,
      });
    }

    // Network error
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Network error. Please check your connection.",
      details: err instanceof Error ? err.message : String(err),
      isNetworkError: true,
    });
  }

  return (await parseBody(res)) as T;
}
