import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuthStore } from '../hooks/use-auth-store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set auth and persist tokens to localStorage', () => {
    const mockUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER' as const,
    }

    useAuthStore.getState().setAuth(mockUser, 'access123', 'refresh123')

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('access123')
    expect(state.refreshToken).toBe('refresh123')
    expect(state.isAuthenticated).toBe(true)

    expect(localStorage.getItem('access_token')).toBe('access123')
    expect(localStorage.getItem('refresh_token')).toBe('refresh123')
  })

  it('should logout and clear state and localStorage', () => {
    const mockUser = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER' as const,
    }

    useAuthStore.getState().setAuth(mockUser, 'access123', 'refresh123')
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  it('should set tokens separately', () => {
    useAuthStore.getState().setTokens('new_access', 'new_refresh')
    
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('new_access')
    expect(state.refreshToken).toBe('new_refresh')

    expect(localStorage.getItem('access_token')).toBe('new_access')
    expect(localStorage.getItem('refresh_token')).toBe('new_refresh')
  })

  it('should set profile', () => {
    const mockProfile = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    }

    useAuthStore.getState().setProfile?.(mockProfile)
    expect(useAuthStore.getState().profile).toEqual(mockProfile)
  })
})
