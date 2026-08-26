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
});
