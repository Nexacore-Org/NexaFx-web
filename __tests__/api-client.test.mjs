import { test } from "node:test";
import assert from "node:assert/strict";

import { apiRequest, ApiError } from "../lib/api-client.ts";

function mockFetch(response) {
  const original = globalThis.fetch;
  globalThis.fetch = async () => response;
  return () => {
    globalThis.fetch = original;
  };
}

test("apiRequest resolves undefined for a 204 No Content response", async () => {
  const restore = mockFetch(new Response(null, { status: 204 }));
  try {
    const result = await apiRequest("/api/auth/sessions/abc", {
      method: "DELETE",
      skipAuth: true,
    });
    assert.equal(result, undefined);
  } finally {
    restore();
  }
});

test("apiRequest resolves undefined for an empty 200 body", async () => {
  const restore = mockFetch(
    new Response("", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  try {
    const result = await apiRequest("/api/empty", { skipAuth: true });
    assert.equal(result, undefined);
  } finally {
    restore();
  }
});

test("apiRequest throws for a 200 with a non-JSON body", async () => {
  const restore = mockFetch(
    new Response("<html>ok</html>", {
      status: 200,
      headers: { "content-type": "text/html" },
    }),
  );
  try {
    await assert.rejects(
      () => apiRequest("/api/html", { skipAuth: true }),
      (err) =>
        err instanceof ApiError &&
        err.message === "Unexpected non-JSON response" &&
        err.status === 200,
    );
  } finally {
    restore();
  }
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
