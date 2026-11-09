/**
 * Parses a balance string (e.g. "1,234.56" or "0.00") into a raw numeric balance,
 * stripping thousands separators so large balances are accurately evaluated.
 */
export function parseBalanceAmount(
  balance: string | number | undefined | null
): number {
  if (balance === undefined || balance === null) return 0;
  if (typeof balance === "number") return isNaN(balance) ? 0 : balance;
  const cleaned = balance.replace(/,/g, "").trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
