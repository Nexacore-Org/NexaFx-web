'use client'

import { useState } from 'react'
import { useNavigate } from 'next/navigation'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPending(true)

    // Terms must be checked
    if (!terms) {
      setError('You must accept the terms and conditions')
      setPending(false)
      return
    }

    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Name is required')
      setPending(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Valid email is required')
      setPending(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setPending(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setPending(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password }),
        credentials: 'include',
      })

      if (res.status === 409) {
        setError('Email already taken')
        setPending(false)
        return
      }

      if (!res.ok) {
        setError('Failed to create account')
        setPending(false)
        return
      }

      // On success, navigate to OTP verification carrying the email
      navigate('/(auth)/verify', {
        state: { email },
        replace: true,
      })
    } catch (err) {
      setError('Network error. Please try again.')
      setPending(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="max-w-md p-6">
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="first-name">
            First Name
          </label>
          <input
            id="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="shadow appearance-none rounded border border-gray-400 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="last-name">
            Last Name
          </label>
          <input
            id="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="shadow appearance-none rounded border border-gray-400 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none rounded border border-gray-400 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="phone">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="shadow appearance-none rounded border border-gray-400 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="enter your phone (optional)"
          />
          <p className="text-xs text-gray-500">E.164 format (e.g., +1234567890)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="rounded border gray-500"
            />
            I accept the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  )
}