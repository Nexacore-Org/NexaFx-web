import { NextResponse } from 'next/server'
import { setSessionCookie, deleteSessionCookie } from '@/app/api/auth/lib/session'

export async function POST(request: Request) {
  // Call backend to refresh token
  const res = await fetch('https://api.example.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    credentials: 'include',
  })

  if (res.ok) {
    const data = await res.json()
    // Refresh httpOnly cookie
    await setSessionCookie(data.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.expiresIn,
    })
    return Next.json({ user: data.user }, { status: 200 })
  }

  // If refresh fails, sign out
  await deleteSessionCookie()
  return Next.json({ error: 'Refresh failed' }, { status: 401 })
}