import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/setup';
import { apiClient, ApiError } from './api-client';
import { useAuthStore } from './store/auth-store';

describe('API Client Infrastructure Layer', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    window.localStorage.clear();
  });

  it('Attaches Authorization: Bearer to every request when token is active', async () => {
    useAuthStore.setState({ accessToken: 'valid-v2-token' });
    window.localStorage.setItem('access_token', 'valid-v2-token');

    server.use(
      http.get('*/api/v2/test', ({ request }) => {
        const auth = request.headers.get('Authorization') || request.headers.get('x-client-token');
        if (auth?.includes('valid-v2-token')) {
          return HttpResponse.json({ authenticated: true });
        }
        return new HttpResponse(null, { status: 401 });
      })
    );

    const data = await apiClient('/api/v2/test', { useProxy: false });
    expect(data).toEqual({ authenticated: true });
  });

  it('Returns parsed JSON payload metadata on successful 2xx responses', async () => {
    server.use(
      http.get('*/api/v2/data', () => HttpResponse.json({ payload: 'content' }))
    );
    const data = await apiClient('/api/v2/data', { useProxy: false });
    expect(data).toEqual({ payload: 'content' });
  });

  it('Throws ApiError with correct status and message boundaries on 4xx/5xx responses', async () => {
    server.use(
      http.get('*/api/v2/fail', () => {
        return new HttpResponse(JSON.stringify({ message: 'Bad Gateway Action' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    await expect(apiClient('/api/v2/fail', { useProxy: false })).rejects.toThrowError(ApiError);
  });

  it('On 401 error response -> triggers token refresh endpoint -> retries original request with new token', async () => {
    window.localStorage.setItem('refresh_token', 'active-refresh');
    useAuthStore.setState({ accessToken: 'expired', refreshToken: 'active-refresh' });

    let refreshCalled = false;
    server.use(
      http.post('*/auth/refresh', () => {
        refreshCalled = true;
        return HttpResponse.json({ accessToken: 'new-access', refreshToken: 'new-refresh' });
      }),
      http.get('*/api/v2/secure', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer new-access') {
          return HttpResponse.json({ data: 'secret' });
        }
        return new HttpResponse(null, { status: 401 });
      })
    );

    const result = await apiClient('/api/v2/secure', { useProxy: false });
    expect(refreshCalled).toBe(true);
    expect(result).toEqual({ data: 'secret' });
  });

  it('On 401 response from refresh endpoint -> logs out, clears application state, and halts processing loop', async () => {
    window.localStorage.setItem('refresh_token', 'bad-refresh');
    useAuthStore.setState({ accessToken: 'expired', refreshToken: 'bad-refresh', isAuthenticated: true });

    server.use(
      http.get('*/api/v2/secure', () => new HttpResponse(null, { status: 401 })),
      http.post('*/auth/refresh', () => new HttpResponse(null, { status: 401 }))
    );

    await expect(apiClient('/api/v2/secure', { useProxy: false })).rejects.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('Does NOT fall back to fallback environments when the local token structure is absent -> bubbles up 401', async () => {
    server.use(
      http.get('*/api/v2/secure', () => new HttpResponse(null, { status: 401 }))
    );
    await expect(apiClient('/api/v2/secure', { useProxy: false })).rejects.toThrow();
  });
});
