import { describe, test, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/setup';
import { apiClient, ApiError } from './api-client';
import { useAuthStore } from './store/auth-store';

describe('API Client tests via MSW runtime handles', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, refreshToken: null });
  });

  test('Attaches Authorization: Bearer to every request when token exists', async () => {
    useAuthStore.setState({ accessToken: 'test-valid-jwt-token' });

    server.use(
      http.get('/api/protected-route', ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        if (authHeader === 'Bearer test-valid-jwt-token') {
          return HttpResponse.json({ secure: true });
        }
        return new HttpResponse(null, { status: 401 });
      })
    );

    const res = await apiClient.get('/api/protected-route');
    expect(res).toEqual({ secure: true });
  });

  test('Returns parsed JSON on 2xx responses', async () => {
    server.use(
      http.get('/api/data', () => HttpResponse.json({ success: true, count: 5 }))
    );
    const res = await apiClient.get('/api/data');
    expect(res).toEqual({ success: true, count: 5 });
  });

  test('Throws ApiError with correct status and message on 4xx/5xx errors', async () => {
    server.use(
      http.get('/api/error', () => HttpResponse.json({ message: 'Invalid payload configuration' }, { status: 400 }))
    );

    await expect(apiClient.get('/api/error')).rejects.toThrowError(ApiError);
    try {
      await apiClient.get('/api/error');
    } catch (err: any) {
      expect(err.status).toBe(400);
      expect(err.message).toBe('Invalid payload configuration');
    }
  });

  test('On 401 -> calls refresh endpoint -> retries original request with new token', async () => {
    useAuthStore.setState({ accessToken: 'expired-token', refreshToken: 'valid-refresh-token' });
    let initialAttemptHeader: string | null = null;
    let retryAttemptHeader: string | null = null;

    server.use(
      http.post('/api/auth/refresh', async ({ request }) => {
        return HttpResponse.json({ accessToken: 'fresh-new-token', refreshToken: 'valid-refresh-token' });
      }),
      http.get('/api/retry-route', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer expired-token') {
          initialAttemptHeader = auth;
          return new HttpResponse(null, { status: 401 });
        }
        if (auth === 'Bearer fresh-new-token') {
          retryAttemptHeader = auth;
          return HttpResponse.json({ recovered: true });
        }
        return new HttpResponse(null, { status: 403 });
      })
    );

    const result = await apiClient.get('/api/retry-route');
    expect(initialAttemptHeader).toBe('Bearer expired-token');
    expect(retryAttemptHeader).toBe('Bearer fresh-new-token');
    expect(result).toEqual({ recovered: true });
    expect(useAuthStore.getState().accessToken).toBe('fresh-new-token');
  });

  test('On 401 from refresh endpoint -> calls clearAuth() and stops retrying', async () => {
    const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth');
    useAuthStore.setState({ accessToken: 'expired-token', refreshToken: 'dead-refresh-token' });

    server.use(
      http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 401 })),
      http.get('/api/retry-route', () => new HttpResponse(null, { status: 401 }))
    );

    await expect(apiClient.get('/api/retry-route')).rejects.toThrow();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  test('Does NOT fall back to any env variable when token is missing — returns 401 execution errors', async () => {
    server.use(
      http.get('/api/strict-route', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (!auth || auth.includes('undefined')) {
          return new HttpResponse(null, { status: 401 });
        }
        return HttpResponse.json({ success: true });
      })
    );

    await expect(apiClient.get('/api/strict-route')).rejects.toThrow();
  });
});