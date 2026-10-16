'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
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
    // Log once for diagnostics; recovery is explicit and user-driven, so we
    // never auto-retry (which could loop on a persistent failure).
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="max-w-md text-sm text-gray-600">
        We hit an unexpected problem loading this page. You can try again — if it keeps happening,
        please contact support.
      </p>
      {recover && (
        <button
          type="button"
          onClick={() => recover()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
