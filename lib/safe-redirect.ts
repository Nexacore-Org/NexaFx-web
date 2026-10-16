/**
 * Safe redirect helper that prevents open redirects.
 * Only allows same-origin relative paths starting with a single slash.
 * External URLs, protocol-relative URLs, and absolute URLs are rejected.
 */

// Backslashes and ASCII control characters, including DEL. Browsers may
// normalise these into a scheme-relative or absolute URL after a redirect.
const UNSAFE_CHARS = /[\u0000-\u001f\u007f\\]/;

export function isSafeRedirect(
  path: string | null | undefined,
): path is string {
  if (!path) return false;
  // Must start with exactly one slash (not double slash or protocol-relative)
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return !UNSAFE_CHARS.test(path);
}

/**
 * Returns `path` when it is a safe same-origin redirect target, otherwise
 * `fallback`.
 */
export function safeRedirect(
  path: string | null | undefined,
  fallback = "/dashboard",
): string {
  return isSafeRedirect(path) ? path : fallback;
}
