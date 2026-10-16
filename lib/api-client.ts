export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | string[]>;
  headers?: Record<string, string>;
}

export interface ApiErrorInit {
  status: number | null;
  code: string | null;
  message: string;
  details: unknown | null;
  isNetworkError: boolean;
}

export class ApiError extends Error {
  status: number | null;
  code: string | null;
  details: unknown | null;
  isNetworkError: boolean;

  constructor({
    status,
    code,
    message,
    details,
    isNetworkError,
  }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.message = message;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * A 401 handler registered by the auth layer. It returns `true` when the
 * request was refreshed and should be retried once, or `false` when recovery
 * is not possible (e.g. the refresh token itself expired).
 */
export type UnauthorizedHandler = (path: string) => Promise<boolean>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

async function execute(
  url: string,
  { method, body, headers }: RequestOptions,
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      throw new ApiError({
        status: res.status,
        code: data?.code ?? null,
        message: data?.message ?? `Request failed with status ${res.status}`,
        details: data ?? null,
        isNetworkError: false,
      });
    }
    return data as T;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError({
      status: res.status,
      code: null,
      message: `Request failed with status ${res.status}`,
      details: text.substring(0, 200),
      isNetworkError: false,
    });
  }

  const text = await res.text();
  throw new ApiError({
    status: res.status,
    code: null,
    message: "Unexpected non-JSON response",
    details: text.substring(0, 200),
    isNetworkError: false,
  });
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, query, headers }: RequestOptions = {},
): Promise<T> {
  // Build URL with query string
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const url = new URL(path, baseUrl);

  // Add query parameters safely
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const arr = Array.isArray(value) ? value : [value];
        arr.forEach((item) => url.searchParams.append(key, String(item)));
      }
    });
  }

  try {
    const options: RequestOptions = { method, body, headers };
    let res = await execute(url.toString(), options);

    // On 401, give the auth layer a chance to refresh and retry once.
    if (res.status === 401 && unauthorizedHandler) {
      const recovered = await unauthorizedHandler(path);
      if (recovered) {
        res = await execute(url.toString(), options);
      }
    }

    return await parseResponse<T>(res);
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;

    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError({
        status: 0,
        code: "REQUEST_TIMEOUT",
        message: "Request timed out",
        details: null,
        isNetworkError: true,
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
}
