'use client'
import { useEffect, useState } from 'react'
import { balanceSocket } from '@/lib/realtime/balance-socket'
import { useAuthStore } from '@/hooks/use-auth-store'

export function useRealtimeBalance() {
  const [isConnected, setIsConnected] = useState(false)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    balanceSocket.on('connected', () => setIsConnected(true))
    balanceSocket.on('disconnected', () => setIsConnected(false))
    balanceSocket.connect()

    return () => {
      balanceSocket.disconnect()
    }
  }, [isAuthenticated])

  return { isConnected }
}
