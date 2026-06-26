import { useAuthStore } from "@/hooks/use-auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const PROXY_URL = "/api/proxy";

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
        throw new ApiError(data?.message || "Unauthorized", response.status);
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh(async () => {
          try {
            const retryResponse = await executeRequest();
            if (!retryResponse.ok) {
              const data = await retryResponse.json().catch(() => ({}));
              reject(
                new ApiError(
                  data?.message ||
                    `Request failed with status ${retryResponse.status}`,
                  retryResponse.status,
                ),
              );
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

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return response.json();
}
