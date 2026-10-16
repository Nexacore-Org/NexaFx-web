'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string }
  reset?: () => void
  retry?: () => void
}) {
  const recover = retry ?? reset

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center"
    >
      <h2 className="text-lg font-semibold text-red-800">This section failed to load</h2>
      <p className="max-w-md text-sm text-red-700">
        Something went wrong while loading this part of your dashboard.
      </p>
      {recover && (
        <button
          type="button"
          onClick={() => recover()}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
