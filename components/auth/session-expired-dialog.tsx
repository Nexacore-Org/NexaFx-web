'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/ui/dialog'
import { loginRedirectFor } from '@/lib/safe-redirect'

export function SessionExpiredDialog({
  open,
  onDismiss,
  onSignedOut,
}: {
  open: boolean
  onDismiss: () => void
  onSignedOut: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const handleSignInAgain = () => {
    // Drop any cached data that belongs to the expired session and reset the
    // auth state before sending the user to login with a safe `next`.
    queryClient.clear()
    onSignedOut()
    router.push(loginRedirectFor(pathname))
  }

  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      title="Your session has expired"
      description="For your security you were signed out. Sign in again to continue where you left off — your place has been saved."
    >
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: 'transparent',
            color: '#374151',
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={handleSignInAgain}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#2563eb',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Sign in again
        </button>
      </div>
    </Dialog>
  )
}
