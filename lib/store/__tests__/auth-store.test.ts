import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuthStore } from '../auth-store'

describe('auth-store (v2)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('no name field on user — only firstName and lastName', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    const user = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER' as const,
    }
    expect('name' in user).toBe(false)
  })

  it('setAuth stores user, tokens, and sets isAuthenticated', () => {
    const user = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER' as const,
    }

    useAuthStore.getState().setAuth(user, 'access123', 'refresh123')

    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.accessToken).toBe('access123')
    expect(state.refreshToken).toBe('refresh123')
    expect(state.isAuthenticated).toBe(true)

    expect(localStorage.getItem('access_token')).toBe('access123')
    expect(localStorage.getItem('refresh_token')).toBe('refresh123')
  })

  it('updateTokens replaces tokens only, preserves user', () => {
    const user = {
      id: '1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'ADMIN' as const,
    }

    useAuthStore.getState().setAuth(user, 'old_access', 'old_refresh')
    useAuthStore.getState().updateTokens('new_access', 'new_refresh')

    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.accessToken).toBe('new_access')
    expect(state.refreshToken).toBe('new_refresh')
    expect(state.isAuthenticated).toBe(true)
  })

  it('clearAuth resets all fields and clears localStorage', () => {
    const user = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'USER' as const,
    }

    useAuthStore.getState().setAuth(user, 'access123', 'refresh123')
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })
})
