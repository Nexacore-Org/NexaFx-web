export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | string[]>;
  headers?: Record<string, string>;
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
  }: {
    status: number | null;
    code: string | null;
    message: string;
    details?: unknown;
    isNetworkError: boolean;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.message = message;
    this.details = details ?? null;
    this.isNetworkError = isNetworkError;
  }
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

  const signal = AbortSignal.timeout(10000);

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    // Parse response defensively
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return data as T;
    }

    // Handle non-JSON responses (e.g., HTML error pages)
    const text = await res.text();
    throw new ApiError({
      status: res.status,
      code: null,
      message: `Request failed with status ${res.status}`,
      details: text.substring(0, 200),
      isNetworkError: false,
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;

    const name = err instanceof Error ? err.name : "";
    if (name === "AbortError" || name === "TimeoutError") {
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
