import { useAuthStore } from "@/hooks/use-auth-store";
import * as Sentry from "@sentry/nextjs";
import { parseRetryAfter } from "./utils/retry-after";

// ---------------------------------------------------------------------------
// Startup guard — NEXT_PUBLIC_API_URL is required for every API call.
// Throwing at module-load time surfaces the misconfiguration immediately
// during `next dev` or `next build` instead of silently failing at runtime.
// ---------------------------------------------------------------------------
if (
  typeof process !== "undefined" &&
  !process.env.NEXT_PUBLIC_API_URL
) {
  throw new Error(
    "[NexaFx] NEXT_PUBLIC_API_URL is not set. " +
      "Add it to your .env.local file. " +
      "See .env.example for the required variables."
  );
}

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PROXY_URL = "/api/proxy";

/**
 * API modules should use the default `useProxy: true` for requests that can be
 * routed through Next.js. The proxy translates the browser's `x-client-token`
 * into the backend's `Authorization` header and keeps that token forwarding in
 * one place. Use `useProxy: false` only for modules that call the backend
 * directly and therefore depend on backend CORS configuration (currently auth,
 * users, notifications, currencies, and similar user-scoped APIs). See the
 * "Proxy and Token Behaviour" section of API_AUDIT.md for the module list and
 * the security rationale behind this distinction.
 */

export const OFFLINE_STALE_DATA_MESSAGE =
  "You're offline. This data may be out of date.";
export const OFFLINE_EMPTY_DATA_MESSAGE =
  "Unable to load — you appear to be offline.";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class OfflineError extends ApiError {
  constructor(message = "No internet connection") {
    super(message, 0);
    this.name = "OfflineError";
  }
}

export function isOfflineError(error: unknown): error is OfflineError {
  return error instanceof ApiError && error.status === 0;
}

export function getOfflineMessage(hasCachedData: boolean) {
  return hasCachedData
    ? OFFLINE_STALE_DATA_MESSAGE
    : OFFLINE_EMPTY_DATA_MESSAGE;
}

export function getRequestErrorMessage(
  error: unknown,
  options: {
    fallback: string;
    hasCachedData?: boolean;
  },
) {
  if (isOfflineError(error)) {
    return getOfflineMessage(Boolean(options.hasCachedData));
  }

  return error instanceof Error ? error.message : options.fallback;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  useProxy?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

function captureApiError(error: ApiError, endpoint: string) {
  Sentry.captureException(error, {
    extra: {
      endpoint,
      status: error.status,
    },
  });
}

async function refreshToken(): Promise<string | null> {
  const refreshTokenStr =
    typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null;
  if (!refreshTokenStr) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenStr }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data;

    if (accessToken && newRefreshToken) {
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error("Refresh token error:", error);
    useAuthStore.getState().logout();
    return null;
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new OfflineError("No internet connection");
  }

  const { params, useProxy = true, ...fetchOptions } = options;

  let url = "";
  if (useProxy) {
    url = `${PROXY_URL}${path.startsWith("/") ? path : `/${path}`}`;
  } else {
    url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }

  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach((key) => searchParams.append(key, params[key]));
  }
  const finalUrl = searchParams.toString()
    ? `${url}?${searchParams.toString()}`
    : url;

  const getHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    const headers = new Headers(fetchOptions.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      if (useProxy) {
        headers.set("x-client-token", token);
      } else {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  };

  const executeRequest = async (): Promise<Response> => {
    try {
      return await fetch(finalUrl, {
        ...fetchOptions,
        headers: getHeaders(),
      });
    } catch (error) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        throw new OfflineError("No internet connection");
      }

      throw error;
    }
  };

  let response = await executeRequest();

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshToken();
      isRefreshing = false;
      if (newToken) {
        onRefreshed(newToken);
      } else {
        refreshSubscribers = [];
        const data = await response
          .clone()
          .json()
          .catch(() => ({}));
        const error = new ApiError(
          data?.message || "Unauthorized",
          response.status,
        );
        captureApiError(error, finalUrl);
        throw error;
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh(async () => {
          try {
            const retryResponse = await executeRequest();
            if (!retryResponse.ok) {
              const data = await retryResponse.json().catch(() => ({}));
              const error = new ApiError(
                data?.message ||
                  `Request failed with status ${retryResponse.status}`,
                retryResponse.status,
              );
              captureApiError(error, finalUrl);
              reject(error);
              return;
            }
            resolve(await retryResponse.json());
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    response = await executeRequest();
  }

  if (response.status === 429) {
    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterSeconds = parseRetryAfter(retryAfterHeader);
    throw new RateLimitError(retryAfterSeconds);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
    );
    captureApiError(error, finalUrl);
    throw error;
  }

  return response.json();
}
