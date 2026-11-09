import { isValidStellarAddress, isValidMemo, truncateAddress } from "@/lib/stellar";

export interface StellarValidationResult {
  valid: boolean;
  error?: string;
  reason?: string;
}

/**
 * Validates a Stellar public address (starts with G, 56 characters, valid alphabet).
 * Wraps lib/stellar.ts isValidStellarAddress.
 */
export function validateStellarAddress(address: string): StellarValidationResult {
  if (!address || typeof address !== "string") {
    return {
      valid: false,
      error: "Address is required",
      reason: "Address is required",
    };
  }
  const result = isValidStellarAddress(address);
  return {
    valid: result.valid,
    error: result.reason,
    reason: result.reason,
  };
}

/**
 * Known custodial exchange and gateway addresses that strictly require a destination memo.
 */
export const KNOWN_EXCHANGES_REQUIRING_MEMO: readonly string[] = [
  "GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSBRTC42RFMAFDXBTY6AXCYCTRE", // Coinbase
  "GCGNWKCJ3KHRLPM3TM6N7D3W5YKDJMG62GLTVCWGCOO6GPPZST2VTV35", // Binance
  "GD6WU6HAJI2RL7GU3QW3Q3DAFM5F6AVG6A5DC5AOG2MQHWDTRPOOGFD7", // Kraken
  "GB6YPGW5JFMMP2QB2USQ33EUWTZXVL4MTMKISUMAMYXPL5ACVDNOINNN", // Bitfinex
  "GBUQWP3BOUZX34TOND2QV7QQWMTD742N5Y5U2V5QAXN46B5UOG6B7G5G", // KuCoin
];

/**
 * Determines whether a destination address requires a memo.
 */
export function requiresMemo(destination: string): boolean {
  if (!destination || typeof destination !== "string") return false;
  const normalized = destination.trim().toUpperCase();
  return KNOWN_EXCHANGES_REQUIRING_MEMO.includes(normalized);
}

export { isValidStellarAddress, isValidMemo, truncateAddress };
