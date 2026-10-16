'use client'

import { useEffect, useState } from 'react'

export function Skeleton({ width = '100%', height = '16px', animation = true }: { width?: string; height?: string; animation?: boolean }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const listener = () => setReducedMotion(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  if (reducedMotion || !animation) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: '#e5e7eb',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#e5e7eb',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        borderRadius: '4px',
      }}
    />
  )
}