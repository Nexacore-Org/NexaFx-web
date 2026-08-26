import { useAuthStore } from '@/hooks/use-auth-store'

type EventHandler = (data: any) => void

class BalanceSocket {
  private ws: WebSocket | null = null
  private handlers: Map<string, EventHandler[]> = new Map()
  private reconnectAttempts = 0
  private maxRetries = 5
  private shouldReconnect = true

  connect() {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
    this.ws = new WebSocket(`${wsUrl}?token=${token}`)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.emit('connected', null)
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type) {
          this.emit(data.type, data.payload)
        }
      } catch { /* ignore parse errors */ }
    }

    this.ws.onclose = () => {
      this.emit('disconnected', null)
      if (this.shouldReconnect && this.reconnectAttempts < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
        this.reconnectAttempts++
        setTimeout(() => this.connect(), delay)
      }
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  disconnect() {
    this.shouldReconnect = false
    this.ws?.close()
    this.ws = null
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, [])
    }
    this.handlers.get(event)!.push(handler)
  }

  off(event: string, handler: EventHandler) {
    const handlers = this.handlers.get(event)
    if (handlers) {
      const idx = handlers.indexOf(handler)
      if (idx > -1) handlers.splice(idx, 1)
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event)
    handlers?.forEach(h => h(data))
  }
}

export const balanceSocket = new BalanceSocket()
