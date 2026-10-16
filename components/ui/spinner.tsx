'use client'

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const sizeMap = {
  sm: '12px',
  md: '20px',
  lg: '32px',
} as const

export function Spinner({
  size = 'md',
  label = 'Loading',
}: {
  size?: keyof typeof sizeMap
  label?: string
}) {
  const reducedMotion = usePrefersReducedMotion()
  const dimension = sizeMap[size]

  return (
    <span
      role="status"
      aria-label={label}
      style={{
        display: 'inline-block',
        width: dimension,
        height: dimension,
        border: '3px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: reducedMotion ? undefined : 'spinner-spin 1s linear infinite',
      }}
    />
  )
}
