/**
 * Client-side idempotency key utilities.
 *
 * Each "submission intent" gets one key that is stable across automatic
 * retries of the same submission but replaced for a deliberately new attempt.
 *
 * Usage:
 *   const key = generateIdempotencyKey();           // new intent
 *   const header = idempotencyHeader(key);           // { 'Idempotency-Key': key }
 *
 * NOTE: The backend must honour the `Idempotency-Key` header for
 * deduplication to work end-to-end. Until that support is confirmed,
 * the key is still sent so that a future backend update requires no
 * frontend changes. The client-side `useSubmitOnce` guard already
 * prevents duplicate in-flight requests regardless of backend support.
 */

/**
 * Generate a new idempotency key for a single submission intent.
 * Call this once per user-initiated action, not per automatic retry.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Return a headers object containing the idempotency key, ready to
 * spread into a fetch / apiClient `headers` option.
 */
export function idempotencyHeader(key: string): Record<string, string> {
  return { "Idempotency-Key": key };
}
