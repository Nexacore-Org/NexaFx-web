'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  User,
  SessionStatus,
  isAdmin as checkIsAdmin,
  displayName,
} from '@/types/user'
import { configureApiClient } from '@/lib/api-client-refresh'
import { SessionExpiredDialog } from '@/components/auth/session-expired-dialog'

type AuthContextValue = {
  user: User | null
  status: SessionStatus
  sessionExpired: boolean
  logout: () => void
  dismissSessionExpired: () => void
  isAdmin: (user: User) => boolean
  displayName: (user: User) => string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [sessionExpired, setSessionExpired] = useState(false)

  const logout = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
    setSessionExpired(false)
  }, [])

  const dismissSessionExpired = useCallback(() => {
    setSessionExpired(false)
  }, [])

  const refreshToken = useCallback(async () => {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) {
      throw new Error('Session refresh failed')
    }
  }, [])

  // Route API client 401s through the single-flight refresh. When refresh is
  // no longer possible, surface the re-authentication dialog instead of an
  // unhandled error.
  useEffect(() => {
    configureApiClient({
      refreshToken,
      onAuthFailure: () => {
        setUser(null)
        setStatus('unauthenticated')
        setSessionExpired(true)
      },
    })
  }, [refreshToken])

  useEffect(() => {
    let cancelled = false

    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/profile', {
          credentials: 'include',
        })
        if (cancelled) return
        if (res.ok) {
          const data = await res.json()
          setUser(data?.user ?? null)
          setStatus(data?.user ? 'authenticated' : 'unauthenticated')
        } else {
          setUser(null)
          setStatus('unauthenticated')
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          setStatus('unauthenticated')
        }
      }
    }

    fetchSession()

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      sessionExpired,
      logout,
      dismissSessionExpired,
      isAdmin: checkIsAdmin,
      displayName,
    }),
    [user, status, sessionExpired, logout, dismissSessionExpired]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredDialog
        open={sessionExpired}
        onDismiss={dismissSessionExpired}
        onSignedOut={logout}
      />
    </AuthContext.Provider>
  )
}
