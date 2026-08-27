import { apiClient } from '../api-client';

jest.mock('@/hooks/use-auth-store', () => ({
  useAuthStore: {
    getState: () => ({
      logout: jest.fn(),
      setTokens: jest.fn(),
    })
  }
}));

global.fetch = jest.fn();

describe('apiClient', () => {
  let localStorageMock: any;

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  it('should throw an error on 400 status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' }),
    });

    await expect(apiClient('/test')).rejects.toThrow('Bad Request');
  });

  it('should return data on success', async () => {
    const mockData = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await apiClient('/test');
    expect(result).toEqual(mockData);
  });

  it('should retry on 401 and refresh token', async () => {
    window.localStorage.getItem = jest.fn().mockImplementation((key) => {
      if (key === 'refresh_token') return 'mock-refresh';
      return null;
    });

    const mockData = { success: true };
    
    // First call to the endpoint fails with 401
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      clone: () => ({ json: async () => ({}) }),
      json: async () => ({ message: 'Unauthorized' }),
    });

    // Refresh token request succeeds
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'new-token', refreshToken: 'new-refresh' }),
    });

    // Retry call succeeds
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await apiClient('/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should route through /api/proxy when useProxy is true', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ proxy: true }),
    });

    const result = await apiClient('/test', { useProxy: true });
    expect(result).toEqual({ proxy: true });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/test',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it('should build query string from params option', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiClient('/test', { params: { foo: 'bar', baz: 'qux' } });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/proxy/test?foo=bar&baz=qux'),
      expect.anything()
    );
  });

  it('should handle empty params', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiClient('/test', { params: {} });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/test',
      expect.anything()
    );
  });

  it('should URL-encode special characters in params', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiClient('/test', { params: { q: 'hello world&foo=bar' } });
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('q=hello+world%26foo%3Dbar');
  });
});
