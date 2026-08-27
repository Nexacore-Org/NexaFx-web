'use client'

import { useState, useEffect } from 'react'
import { Info, TrendingUp } from 'lucide-react'
import { getReferenceRate } from '@/lib/api/reference-rates'

interface RateComparisonProps {
  fromCurrency: string
  toCurrency: string
  nexafexRate: number
}

export function RateComparison({ fromCurrency, toCurrency, nexafexRate }: RateComparisonProps) {
  const [referenceRate, setReferenceRate] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    let active = true
    getReferenceRate(fromCurrency, toCurrency)
      .then(rate => {
        if (active && rate > 0) setReferenceRate(rate)
      })
      .catch(() => {})
    return () => { active = false }
  }, [fromCurrency, toCurrency])

  if (referenceRate === null || referenceRate === 0 || nexafexRate === 0) return null

  const diff = ((nexafexRate - referenceRate) / referenceRate) * 100
  const absDiff = Math.abs(diff)

  let colorClass: string
  if (absDiff < 0.5) {
    colorClass = 'text-green-600 bg-green-50 border-green-200'
  } else if (absDiff < 1) {
    colorClass = 'text-amber-600 bg-amber-50 border-amber-200'
  } else {
    colorClass = 'text-red-600 bg-red-50 border-red-200'
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${colorClass}`}>
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">vs Mid-Market Rate</span>
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="inline-flex"
          >
            <Info className="h-3.5 w-3.5 opacity-70" />
          </button>
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
              Mid-market rate from Open Exchange Rates
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      </div>
      <span className="text-sm font-semibold">
        {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
      </span>
    </div>
  )
}
