"use client"

import { useEffect, useState, useCallback } from "react"
import { LogIn, KeyRound, Shield, ArrowUpFromLine, UserX, UserCheck, ShieldOff, Edit3, AlertCircle } from "lucide-react"
import { Pagination } from "@/components/shared/pagination"
import { getActivityLog, type ActivityEvent, type ActivityEventType } from "@/lib/api/activity"

const eventIconMap: Record<ActivityEventType, typeof LogIn> = {
  login: LogIn,
  logout: UserX,
  password_changed: KeyRound,
  profile_updated: Edit3,
  '2fa_enabled': Shield,
  '2fa_disabled': ShieldOff,
  withdrawal_submitted: ArrowUpFromLine,
  kyc_verified: UserCheck,
}

const PER_PAGE = 20

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchActivity = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getActivityLog()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity log')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  const totalPages = Math.ceil(events.length / PER_PAGE)
  const paginatedEvents = events.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-destructive text-sm">{error}</p>
        <button onClick={fetchActivity} className="text-sm underline text-muted-foreground hover:text-foreground">
          Try again
        </button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-muted-foreground">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Activity Log</h2>

      <div className="space-y-2">
        {paginatedEvents.map((event) => {
          const Icon = eventIconMap[event.type] || LogIn
          return (
            <div key={event.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <div className="mt-0.5 rounded-full bg-muted p-2">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                  {event.deviceInfo && <span>{event.deviceInfo}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
              {event.type === 'login' && (
                <button
                  onClick={() => {/* report not-me */}}
                  className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  This was not me
                </button>
              )}
            </div>
          )
        })}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
