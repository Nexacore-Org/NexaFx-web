'use client'

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPending(true)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setPending(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, newPassword }),
        credentials: 'include',
      })

      if (res.status === 401) {
        setError('Invalid or expired code')
        setPending(false)
        return
      }

      if (!res.ok) {
        setError('Failed to reset password')
        setPending(false)
        return
      }

      navigate('/login', { state: { success: 'Password reset successful. Please sign in.' } })
    } catch (err) {
      setError('Network error. Please try again.')
      setPending(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="max-w-md p-6">
      <h2>Reset Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="new-password">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={pending}
            required
            minLength={8}
            className="shadow appearance-none rounded border border-gray-400 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="enter new password"
          />
          <p className="text-xs text-gray-500">Minimum 8 characters, at least one letter and one number</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={pending}
            required
            className="shadow appearance-none rounded border border-gray-400 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="confirm password"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? 'Setting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}