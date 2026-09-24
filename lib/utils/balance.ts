/**
 * Parse a user-facing balance string into a number.
 *
 * Balances may be presented with thousands separators (e.g. "1,234,567.89")
 * and a naive `replace(",", "")` only strips the first separator, silently
 * truncating large balances. This strips every separator before parsing.
 */
export function parseBalanceAmount(balance: string): number {
  return parseFloat(balance.replace(/,/g, ""));
}