import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../app/api/auth/login/route.ts';

function makeRequest(body = { email: 'a@b.com', password: 'secret' }) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.API_BASE_URL = 'http://backend.test';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('maps an upstream 500 to a 502 service error, not invalid credentials', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('boom', { status: 500 }));

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe('service_unavailable');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('maps a network failure to a 503 service error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'));

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.error).toBe('service_unavailable');
  });

  it('never sets a cookie when the upstream body is malformed', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe('service_unavailable');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('sets a session cookie on a valid upstream response', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sessionToken: 'tok_123', expiresIn: 3600 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('session=tok_123');
  });

  it('returns 401 for upstream invalid credentials', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('nope', { status: 401 }));

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe('invalid_credentials');
  });
});
