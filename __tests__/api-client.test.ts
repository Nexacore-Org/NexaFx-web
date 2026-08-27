import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiClient, OfflineError, ApiError } from '../lib/api-client'
import { useAuthStore } from '../hooks/use-auth-store'

const mockFetch = vi.fn()

describe('apiClient', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    useAuthStore.getState().logout()
    
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should throw OfflineError when navigator.onLine is false', async () => {
    navigator.onLine = false
    await expect(apiClient('/test')).rejects.toThrow(OfflineError)
  })

  it('should append params to URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    await apiClient('/test', { params: { foo: 'bar', baz: '1' } })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/proxy/test?foo=bar&baz=1'),
      expect.any(Object)
    )
  })

  it('should use proxy by default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    await apiClient('/test')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/proxy/test'),
      expect.any(Object)
    )
  })

  it('should include Authorization header if not using proxy and token exists', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('mock_token')
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    await apiClient('/test', { useProxy: false })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    )
    
    const callArgs = mockFetch.mock.calls[0]
    const headers = callArgs[1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer mock_token')
  })

  it('should include x-client-token header if using proxy and token exists', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('mock_token')
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    await apiClient('/test', { useProxy: true })

    const callArgs = mockFetch.mock.calls[0]
    const headers = callArgs[1].headers as Headers
    expect(headers.get('x-client-token')).toBe('mock_token')
  })

  it('should handle successful response', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData
    })

    const result = await apiClient('/test')
    expect(result).toEqual(mockData)
  })

  it('should throw ApiError on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' })
    })

    await expect(apiClient('/test')).rejects.toThrow(ApiError)
  })

  it('should attempt refresh on 401 response and succeed', async () => {
    // First call fails with 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      clone: () => ({ json: async () => ({}) })
    })

    // Refresh call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'new_access', refreshToken: 'new_refresh' })
    })

    // Retry call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === 'refresh_token') return 'old_refresh'
      return null
    })

    const result = await apiClient('/test')
    expect(result).toEqual({ success: true })
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('should throw ApiError if refresh fails on 401 response', async () => {
    // First call fails with 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      clone: () => ({ json: async () => ({ message: 'Unauthorized' }) })
    })

    // Refresh call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({})
    })

    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === 'refresh_token') return 'old_refresh'
      return null
    })

    await expect(apiClient('/test')).rejects.toThrow(ApiError)
  })

  it('should queue concurrent requests while refreshing token', async () => {
    // 1st call: fails 401
    // 2nd call (concurrent): fails 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      clone: () => ({ json: async () => ({}) })
    })
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      clone: () => ({ json: async () => ({}) })
    })

    // Refresh call: succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'new_access', refreshToken: 'new_refresh' })
    })

    // Retries for 1st and 2nd call: succeed
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: 1 })
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: 2 })
    })

    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === 'refresh_token') return 'old_refresh'
      return null
    })

    const req1 = apiClient('/test1')
    const req2 = apiClient('/test2')

    const [res1, res2] = await Promise.all([req1, req2])
    expect(res1).toEqual({ success: 1 })
    expect(res2).toEqual({ success: 2 })
    expect(mockFetch).toHaveBeenCalledTimes(5)
  })
})
