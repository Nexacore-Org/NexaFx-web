import type { UserLimits } from "@/lib/api/limits";

/**
 * Validates a withdrawal amount against the user's remaining daily and monthly
 * allowances.
 *
 * Returns `null` when the amount is valid, or a human-readable error string
 * when it is rejected.
 */
export function validateWithdrawAmount(
  amount: number,
  limits: UserLimits | null,
): string | null {
  if (!limits) return null; // No limit data – do not block

  const dailyRemaining = limits.daily.limit - limits.daily.used;
  const monthlyRemaining = limits.monthly.limit - limits.monthly.used;

  if (amount > dailyRemaining) {
    return `Amount exceeds your daily remaining allowance of ${limits.currency} ${dailyRemaining.toLocaleString()}. Upgrade your account via KYC to raise this limit.`;
  }

  if (amount > monthlyRemaining) {
    return `Amount exceeds your monthly remaining allowance of ${limits.currency} ${monthlyRemaining.toLocaleString()}. Upgrade your account via KYC to raise this limit.`;
  }

  return null;
}

/**
 * Returns the percentage of a limit period that has been consumed, clamped to
 * [0, 100].
 */
export function usedPercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.max(0, (used / limit) * 100));
}
