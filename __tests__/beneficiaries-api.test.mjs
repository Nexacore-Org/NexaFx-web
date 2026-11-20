import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const originalFetch = global.fetch;

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('beneficiaries api client', () => {
  let fetchMock;
  let api;

  beforeEach(async () => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    vi.resetModules();
    api = await import('../lib/api/beneficiaries.ts');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('lists beneficiaries via apiRequest', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [{ id: '1', name: 'Ada' }] }));

    const result = await api.getBeneficiaries();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/beneficiaries');
    expect(options?.method ?? 'GET').toBe('GET');
    expect(result).toEqual([{ id: '1', name: 'Ada' }]);
  });

  it('creates a beneficiary with a plain-object body (no double stringify)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: '2', name: 'Grace' } }));

    await api.createBeneficiary({ name: 'Grace', relationship: 'sister' });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(typeof options.body).toBe('string');
    const parsed = JSON.parse(options.body);
    expect(parsed).toEqual({ name: 'Grace', relationship: 'sister' });
    expect(typeof parsed).toBe('object');
  });

  it('encodes ids when fetching a single beneficiary', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'a/b c', name: 'Lin' } }));

    await api.getBeneficiary('a/b c');

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(encodeURIComponent('a/b c'));
    expect(String(url)).not.toContain('a/b c');
  });

  it('encodes ids when updating a beneficiary', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 'x y', name: 'Sam' } }));

    await api.updateBeneficiary('x y', { name: 'Sam' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(encodeURIComponent('x y'));
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ name: 'Sam' });
  });

  it('encodes ids when deleting a beneficiary', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));

    await api.deleteBeneficiary('id/with space');

    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain(encodeURIComponent('id/with space'));
    expect(options.method).toBe('DELETE');
  });
});
