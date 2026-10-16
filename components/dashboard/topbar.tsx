'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export function Topbar() {
  const router = useRouter()
  const { user, logout, displayName } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <span className="text-base font-semibold text-gray-900 md:hidden">NexaFx</span>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-gray-700 sm:inline">
            {user ? displayName(user) : 'Account'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
