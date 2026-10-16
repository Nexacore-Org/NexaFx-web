'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { CategoryIcon } from '@/components/notifications/category-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { relativeTime } from '@/lib/time'
import { categoryLabel } from '@/lib/api/notifications'

const MAX_VISIBLE = 5

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { notifications, isPending, isError, refetch, markRead, markAllRead, unreadCount } =
    useNotifications()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  const visible = notifications.slice(0, MAX_VISIBLE)
  const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)

  const handleSelect = (id: string) => {
    setExpandedId((current) => (current === id ? null : id))
    markRead(id)
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      tabIndex={-1}
      className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl outline-none"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead(unreadIds)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isPending ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <Skeleton width={36} height={36} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="45%" height={12} />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="p-4 text-center text-sm text-red-600">
            <p>Couldn&apos;t load notifications.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-xs font-medium text-red-700 underline"
            >
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">You&apos;re all caught up.</p>
        ) : (
          <ul>
            {visible.map((item) => {
              const expanded = expandedId === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    aria-expanded={expanded}
                    className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${
                      item.read ? '' : 'bg-blue-50/40'
                    }`}
                  >
                    <CategoryIcon category={item.category} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900">
                          {item.title}
                        </span>
                        {!item.read && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                            aria-label="Unread"
                          />
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">
                        {categoryLabel(item.category)} · {relativeTime(item.createdAt)}
                      </span>
                      {expanded && (
                        <span className="mt-2 block text-xs text-gray-600">{item.body}</span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-2 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}
