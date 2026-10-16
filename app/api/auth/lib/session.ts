export async function getSessionCookie() {
  const cookie = await import('next/headers').then((mod) => mod.cookies())
  return cookie.get('session')?.value
}

export async function setSessionCookie(value: string, options: {
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: string
  path?: string
} = {}) {
  const cookieStore = await import('next/headers').then((mod) => mod.cookieStore())
  const params = new URLSearchParams()
  if (options.httpOnly) params.append('HttpOnly', 'true')
  if (options.secure) params.append('Secure', 'true')
  if (options.sameSite) params.append('SameSite', options.sameSite)
  if (options.path) params.append('Path', options.path)
  if (options.maxAge) params.append('Max-Age', options.maxAge.toString())
  cookieStore.set('session', value, { ...Object.fromEntries(params.entries()), path: '/' })
}

export async function deleteSessionCookie() {
  const cookieStore = await import('next/headers').then((mod) => mod.cookieStore())
  cookieStore.delete('session')
}