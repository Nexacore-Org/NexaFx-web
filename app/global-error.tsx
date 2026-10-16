'use client'

import { useEffect } from 'react'

/**
 * Replaces the root layout when it (or a provider) throws. Because it renders
 * outside the normal tree it must include <html>/<body> and avoid relying on
 * app styles or providers — everything here uses inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
            color: '#111827',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ maxWidth: '420px', fontSize: '14px', color: '#4b5563' }}>
            A critical error occurred while loading NexaFx. Please try again.
          </p>
          {reset && (
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          )}
        </div>
      </body>
    </html>
  )
}
