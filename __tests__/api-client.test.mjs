import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, apiClient } from '../lib/api-client';

describe('apiClient error handling', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function mockFetchResponse(status, body) {
    global.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: `Status ${status}`,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => body,
      text: async () => JSON.stringify(body),
    });
  }

  it('surfaces message from { code, message } route handler responses', async () => {
    mockFetchResponse(409, { code: 'EMAIL_TAKEN', message: 'Email already registered' });

    await expect(apiClient('/api/auth/login', { method: 'POST' })).rejects.toMatchObject({
      message: 'Email already registered',
      code: 'EMAIL_TAKEN',
      status: 409,
    });
  });

  it('falls back to data.error for legacy { error } route handler responses', async () => {
    mockFetchResponse(400, { error: 'Invalid credentials' });

    await expect(apiClient('/api/auth/login', { method: 'POST' })).rejects.toMatchObject({
      message: 'Invalid credentials',
      status: 400,
    });
  });

  it('falls back to a generic message when no error text is present', async () => {
    mockFetchResponse(500, {});

    await expect(apiClient('/api/profile')).rejects.toBeInstanceOf(ApiError);
  });
});
