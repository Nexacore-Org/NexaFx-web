import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/app/api/auth/lib/session'

export async function GET(request: Request) {
  await deleteSessionCookie()

  // Call backend revoke endpoint if available
  try {
    await fetch('https://api.example.com/auth/revoke', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (err) {
    // ignore revoke errors
  }

  return Next.json({ success: true }, { status: 200 })
}