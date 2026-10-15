import { NextResponse } from 'next/server'
import { setSessionCookie, deleteSessionCookie } from '@/app/api/auth/lib/session'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Call backend - in a real app this would be the actual auth endpoint
  const res = await fetch('https://api.example.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  })

  if (res.ok) {
    const data = await res.json()
    // Set httpOnly cookie with session - never return raw token
    await setSessionCookie(data.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.expiresIn,
    })
    // Return user profile only, not the token
    return Next.json({ user: data.user }, { status: 200 })
  }

  return Next.json({ error: 'Invalid credentials' }, { status: 401 })
}