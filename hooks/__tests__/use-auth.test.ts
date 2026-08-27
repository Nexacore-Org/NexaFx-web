import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '../use-auth'
import { useAuthStore } from '@/lib/store/auth-store'

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  })

  it('returns empty fullName when no user', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.fullName).toBe('')
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('returns computed fullName from firstName and lastName', () => {
    useAuthStore.getState().setAuth(
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'USER' },
      'token',
      'refresh',
    )

    const { result } = renderHook(() => useAuth())
    expect(result.current.fullName).toBe('John Doe')
  })

  it('handles single-part names correctly', () => {
    useAuthStore.getState().setAuth(
      { id: '2', firstName: 'Prince', lastName: '', email: 'p@example.com', role: 'USER' },
      'token',
      'refresh',
    )

    const { result } = renderHook(() => useAuth())
    expect(result.current.fullName).toBe('Prince')
  })

  it('identifies admin users', () => {
    useAuthStore.getState().setAuth(
      { id: '3', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'ADMIN' },
      'token',
      'refresh',
    )

    const { result } = renderHook(() => useAuth())
    expect(result.current.isAdmin).toBe(true)
  })

  it('identifies non-admin users', () => {
    useAuthStore.getState().setAuth(
      { id: '4', firstName: 'Regular', lastName: 'User', email: 'user@example.com', role: 'USER' },
      'token',
      'refresh',
    )

    const { result } = renderHook(() => useAuth())
    expect(result.current.isAdmin).toBe(false)
  })

  it('logout calls clearAuth', () => {
    const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth')

    useAuthStore.getState().setAuth(
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'USER' },
      'token',
      'refresh',
    )

    const { result } = renderHook(() => useAuth())
    result.current.logout()

    expect(clearAuthSpy).toHaveBeenCalled()
  })
})
