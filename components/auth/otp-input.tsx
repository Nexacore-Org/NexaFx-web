'use client'

import { useState } from 'react'

type OTPInputProps = {
  maxDigits?: number
  onSubmit: (code: string) => void
  onChange?: (code: string | null) => void
  resendCount?: number
  onResend?: () => void
}

export const OTPInput = ({ maxDigits = 6, onSubmit, onChange, resendCount = 3, onResend }: OTPInputProps) => {
  const [digits, setDigits] = useState<string[]>([])
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Backspace') {
      if (index === 0 || (index > 0 && digits[index - 1] === '')) {
        setDigits((prev) => {
          const next = [...prev]
          next[index] = ''
          // Remove leading empty digits
          const firstNonEmpty = next.findIndex((d) => d !== '')
          if (firstNonEmpty === -1) return []
          return next.slice(firstNonEmpty)
        })
        event.preventDefault()
      }
    }
  }, [])

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = event.target.value.replace(/\D/g, '')
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value.slice(0, 1)
      if (index < maxDigits - 1) {
        return next
      }
      // Last digit filled - submit
      const code = digits.concat(value.slice(0, 1)).join('')
      onSubmit(code)
      return []
    })
  }, [maxDigits, onSubmit])

  const handlePaste = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, maxDigits)
    setDigits(digits.split('').map((d) => d))
    if (digits.length === maxDigits) {
      const code = digits.join('')
      onSubmit(code)
    }
  }, [maxDigits, onSubmit])

  // Resend countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (resendDisabled) {
      setResendCountdown(resendCount * 1000)
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          const next = prev - 1000
          if (next <= 0) {
            clearInterval(timer!)
            setResendDisabled(false)
            return 0
          }
          return next
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resendDisabled, resendCount])

  const resend = useCallback(() => {
    if (onResend) {
      onResend()
    }
    resetResend()
  }, [onResend])

  const resetResend = useCallback(() => {
    setResendDisabled(false)
    setResendCountdown(0)
  }, [])

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: maxDigits }, (_, i) => (
        <input
          key={i}
          type="text"
          maxLength="1"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`OTP digit ${i + 1}`}
          value={digits[i] || ''}
          onChange={(e) => handleInputChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          style={{
            width: '40px',
            height: '40px',
            fontSize: '24px',
            textAlign: 'center',
            border: '1px solid #ccc',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        />
      ))}

      {resendCount && !resendDisabled && (
        <button
          onClick={resend}
          style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
          disabled={resendDisabled}
        >
          Resend ({(resendCount * 1000 - resendCountdown) / 1000}s)
        </button>
      )}

      {resendDisabled && (
        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
          Resend available in {(resendCountdown / 1000 | 0)}s
        </span>
      )}

      {digits.length === maxDigits && !onSubmit.called && (
        <button onClick={() => onSubmit(digits.join(''))} style={{ display: 'none' }} />
      )}
    </div>
  )
}