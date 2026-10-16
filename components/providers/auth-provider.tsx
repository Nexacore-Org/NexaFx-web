'use client'

import { createContext, useContext, useState, useEffect, children } from 'react'
import { User, SessionStatus, isAdmin, displayName } from '../types/user'
import { useSession as useTansactQuerySession } from '@tanstack/react-query'

type AuthContextValue = {
  user: User | null
  status: SessionStatus
  logout: () => void
  isAdmin: (user: User) => boolean
  displayName: (user: User) => string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<SessionStatus>('loading')

  const logout = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/profile', {
          credentials: 'include',
        })
        if (res.status === 401) {
          setStatus('unauthenticated')
          setUser(null)
        } else if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setStatus(data.user ? 'authenticated' : 'unauthenticated')
        } else {
          setStatus('unauthenticated')
          setUser(null)
        }
      } catch (err) {
        setStatus('unauthenticated')
        setUser(null)
      } finally {
        setStatus('authenticated')
      }
    }
    fetchSession()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      status,
      logout,
      isAdmin,
      displayName,
    }}>
      {children}
    </AuthContext.Provider>
  )
}