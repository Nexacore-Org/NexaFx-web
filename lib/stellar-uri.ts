/**
 * Stellar payment URI parser.
 *
 * Parses both plain Stellar addresses (G…) and `web+stellar:pay` URIs
 * as defined in SEP-0007:
 *   https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
 *
 * Only the `pay` operation is supported — other operations (tx, etc.) are
 * rejected with a descriptive error so the form is never accidentally filled.
 */

import { validateStellarAddress } from "@/lib/utils/stellar-validation";

export interface StellarUriParseResult {
  /** True when parsing succeeded and `destination` is a valid Stellar address. */
  valid: boolean;
  /** The parsed destination address, if valid. */
  destination?: string;
  /** Optional memo text. */
  memo?: string;
  /** Optional memo type (text | id | hash | return). */
  memoType?: string;
  /** Optional asset code (e.g. "USDC"). */
  assetCode?: string;
  /** Optional asset issuer address. */
  assetIssuer?: string;
  /** Optional amount string. */
  amount?: string;
  /** Human-readable error message when `valid` is false. */
  error?: string;
}

const STELLAR_URI_PREFIX = "web+stellar:pay";

/**
 * Parse a QR code string into structured Stellar payment data.
 *
 * Accepts:
 * - A bare Stellar public key (starts with G, 56 chars)
 * - A `web+stellar:pay?destination=G…&…` URI
 *
 * Returns `{ valid: false, error }` for any unrecognised or invalid input.
 */
export function parseStellarUri(raw: string): StellarUriParseResult {
  const value = raw.trim();

  if (!value) {
    return { valid: false, error: "Empty QR code" };
  }

  // Plain Stellar address
  if (!value.startsWith("web+")) {
    const validation = validateStellarAddress(value);
    if (validation.valid) {
      return { valid: true, destination: value };
    }
    return { valid: false, error: validation.error ?? "Invalid QR code content" };
  }

  // Must be a web+stellar:pay URI
  if (!value.toLowerCase().startsWith("web+stellar:pay")) {
    return {
      valid: false,
      error: "Unsupported Stellar URI type. Only 'pay' operations are supported.",
    };
  }

  // Extract the query string — everything after the first '?'
  const queryStart = value.indexOf("?");
  if (queryStart === -1) {
    return { valid: false, error: "Stellar URI is missing parameters" };
  }

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(value.slice(queryStart + 1));
  } catch {
    return { valid: false, error: "Malformed Stellar URI" };
  }

  const destination = params.get("destination") ?? "";
  if (!destination) {
    return { valid: false, error: "Stellar URI is missing the destination address" };
  }

  const addressValidation = validateStellarAddress(destination);
  if (!addressValidation.valid) {
    return {
      valid: false,
      error: `Invalid destination address: ${addressValidation.error}`,
    };
  }

  return {
    valid: true,
    destination,
    memo: params.get("memo") ?? undefined,
    memoType: params.get("memo_type") ?? undefined,
    assetCode: params.get("asset_code") ?? undefined,
    assetIssuer: params.get("asset_issuer") ?? undefined,
    amount: params.get("amount") ?? undefined,
  };
}

/**
 * Return true when the string looks like it could be a Stellar URI or address,
 * without fully validating it. Used to short-circuit scanned non-Stellar QR codes.
 */
export function looksLikeStellarContent(value: string): boolean {
  const v = value.trim();
  if (v.startsWith("G") && v.length === 56) return true;
  if (v.toLowerCase().startsWith(STELLAR_URI_PREFIX)) return true;
  return false;
}
