/**
 * Truncate a wallet/account address for compact display.
 *
 * Short addresses are returned unchanged; longer ones are shown as the first
 * 8 and last 6 characters joined by an ellipsis. This is the single shared
 * implementation so the same address renders identically everywhere in the
 * app (Issue #865).
 */
export function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}
