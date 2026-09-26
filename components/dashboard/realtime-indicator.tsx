'use client'

import { useRealtimeBalance } from '@/hooks/use-realtime-balance'
import { cn } from '@/lib/utils'

export function RealtimeIndicator() {
  const { isConnected } = useRealtimeBalance()

  const dotColor = isConnected
    ? 'bg-green-500'
    : 'bg-yellow-500'

  const tooltip = isConnected
    ? 'Connected — updates in real time'
    : 'Reconnecting...'

  return (
    <div className="relative group flex items-center">
      <span
        className={cn('h-2.5 w-2.5 rounded-full', dotColor)}
        aria-label={tooltip}
      />
      <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none shadow-md border border-border z-50">
        {tooltip}
      </span>
    </div>
  )
}
