'use client'

import { useEffect, useState } from 'react'

export function Spinner({ size = 'md', label }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const[sizeMap] = useState<Record<string, string>>({
    sm: '8px',
    md: '16px',
    lg: '24px',
  })

  const[sizeClass] = useState(() => sizeMap[size] || sizeMap.md)

  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const listener = () => setReducedMotion(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  if (reducedMotion) {
    return (
      <div
        style={{
          width: sizeClass,
          height: sizeClass,
          border: '3px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: sizeClass,
        height: sizeClass,
        border: '3px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spinner-spin 1s linear infinite',
      }}
    />
  )
}