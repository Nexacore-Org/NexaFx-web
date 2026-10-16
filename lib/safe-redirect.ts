/**
 * Safe redirect helper that prevents open redirects.
 * Only allows same-origin relative paths starting with a single slash.
 * External URLs, protocol-relative URLs, and absolute URLs are rejected.
 */
export function isSafeRedirect(path: string | null | undefined): path is string {
  if (!path) return false
  // Must start with exactly one slash (not double slash or protocol-relative)
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://')
}

export function safeRedirect(path: string | null, fallback: string = '/dashboard'): never {
  if (isSafeRedirect(path)) {
    // In a real app, this would use next/navigation or window.location
    // For now, we just validate and return
    return
  }
  // Fallback to safe default
  throw new Error(`Unsafe redirect target: ${path}. Falling back to ${fallback}`)
}