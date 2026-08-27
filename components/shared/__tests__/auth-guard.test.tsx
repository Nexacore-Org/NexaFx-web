import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthGuard } from '../auth-guard'
import { useAuthStore } from '@/lib/store/auth-store'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

describe('AuthGuard', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  })

  it('redirects to /login when not authenticated', () => {
    render(<AuthGuard><div>Protected Content</div></AuthGuard>)

    expect(mockReplace).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useAuthStore.getState().setAuth(
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'USER' },
      'token',
      'refresh',
    )

    render(<AuthGuard><div>Protected Content</div></AuthGuard>)

    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
