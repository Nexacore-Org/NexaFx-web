import { useAuthStore } from '@/hooks/use-auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const PROXY_URL = '/api/proxy';

if (!BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is required. Set NEXT_PUBLIC_API_URL in your environment and restart the app.',
  );
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  useProxy?: boolean;
  skipAuth?: boolean;
}

type RefreshSubscriber = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

function subscribeTokenRefresh(subscriber: RefreshSubscriber) {
  refreshSubscribers.push(subscriber);
}

function onRefreshed() {
  refreshSubscribers.forEach((subscriber) => subscriber.resolve());
  refreshSubscribers = [];
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach((subscriber) => subscriber.reject(error));
  refreshSubscribers = [];
}

async function refreshToken(): Promise<string> {
  const refreshTokenStr = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refreshTokenStr) {
    throw new Error('Missing refresh token');
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refreshTokenStr }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data?.message || data?.error || `Refresh failed with status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const { accessToken, refreshToken: newRefreshToken } = data;

  if (!accessToken || !newRefreshToken) {
    throw new Error('Refresh endpoint returned invalid tokens');
  }

  useAuthStore.getState().setTokens(accessToken, newRefreshToken);
  return accessToken;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, useProxy = true, skipAuth = false, ...fetchOptions } = options;

  const url =
    useProxy && !path.startsWith('http')
      ? `${PROXY_URL}${path.startsWith('/') ? path : `/${path}`}`
      : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach((key) => searchParams.append(key, params[key]));
  }
  const finalUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

  const getHeaders = () => {
    const headers = new Headers(fetchOptions.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (!skipAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) {
        if (useProxy) {
          headers.set('x-client-token', token);
        } else {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
    }

    return headers;
  };

  const executeRequest = (): Promise<Response> => {
    return fetch(finalUrl, {
      ...fetchOptions,
      headers: getHeaders(),
    });
  };

  let response = await executeRequest();

  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await refreshToken();
        onRefreshed();
      } catch (error) {
        onRefreshFailed(error);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.assign('/login');
        }
        throw error;
      } finally {
        isRefreshing = false;
      }
    } else {
      await new Promise<void>((resolve, reject) =>
        subscribeTokenRefresh({ resolve, reject }),
      );
    }

    response = await executeRequest();

    if (response.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Unauthorized');
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
