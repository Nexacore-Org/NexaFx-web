import { useAuthStore } from '@/hooks/use-auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const PROXY_URL = '/api/proxy';

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
  const refreshTokenStr = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refreshTokenStr) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenStr }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data;

    if (accessToken && newRefreshToken) {
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error('Refresh token error:', error);
    useAuthStore.getState().logout();
    return null;
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, useProxy = true, ...fetchOptions } = options;
  
  let url = '';
  if (useProxy) {
    url = `${PROXY_URL}${path.startsWith('/') ? path : `/${path}`}`;
  } else {
    url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
  
  const searchParams = new URLSearchParams();
  if (params) {
    Object.keys(params).forEach((key) => searchParams.append(key, params[key]));
  }
  const finalUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers = new Headers(fetchOptions.headers || {});
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      if (useProxy) {
        headers.set('x-client-token', token);
      } else {
        headers.set('Authorization', `Bearer ${token}`);
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

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshToken();
      isRefreshing = false;
      if (newToken) {
        onRefreshed(newToken);
      } else {
        refreshSubscribers = [];
        const data = await response.clone().json().catch(() => ({}));
        throw new Error(data?.message || 'Unauthorized');
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh(async () => {
          try {
            const retryResponse = await executeRequest();
            if (!retryResponse.ok) {
              const data = await retryResponse.json().catch(() => ({}));
              reject(new Error(data?.message || `Request failed with status ${retryResponse.status}`));
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
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
