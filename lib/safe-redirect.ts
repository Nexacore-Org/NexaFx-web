/**
 * Safe redirect helpers that prevent open redirects.
 * Only same-origin relative paths are allowed. External URLs,
 * protocol-relative URLs and absolute URLs are rejected.
 */

export function isSafeRedirect(path: string | null | undefined): path is string {
  if (!path) return false
  // Must start with exactly one slash (not double slash or protocol-relative)
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://')
}

/**
 * Returns `path` when it is a safe internal redirect, otherwise `fallback`.
 */
export function safeRedirect(path: string | null, fallback: string = '/dashboard'): string {
  return isSafeRedirect(path) ? path : fallback
}

/**
 * Builds a `/login?next=<path>` URL, preserving where the user was so they can
 * be returned there after re-authenticating. Unsafe `next` values fall back to
 * the dashboard.
 */
export function loginRedirectFor(
  nextPath: string | null | undefined,
  fallback: string = '/dashboard'
): string {
  const target = isSafeRedirect(nextPath) ? nextPath : fallback
  return `/login?next=${encodeURIComponent(target)}`
}
