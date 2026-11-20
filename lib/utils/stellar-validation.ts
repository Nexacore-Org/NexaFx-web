/**
 * Stellar address validation helpers.
 *
 * Thin wrappers around `lib/stellar.ts` so consumers can import from
 * `@/lib/utils/stellar-validation` without depending on the full module.
 */

import { validateStellarAddress, requiresMemo } from "@/lib/stellar";

export { validateStellarAddress, requiresMemo };

/**
 * Returns true when the given value is a valid Stellar address.
 */
export function isValidStellarAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  return validateStellarAddress(address);
}

/**
 * Returns true when a memo is required for the given destination address.
 */
export function addressRequiresMemo(address: string | null | undefined): boolean {
  if (!address) return false;
  return requiresMemo(address);
}
