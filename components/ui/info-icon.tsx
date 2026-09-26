'use client'
import { HelpCircle } from 'lucide-react'
import { Tooltip } from './tooltip'

export function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip content={tooltip}>
      <HelpCircle className="inline-block h-4 w-4 text-muted-foreground cursor-help ml-1" />
    </Tooltip>
  )
}
