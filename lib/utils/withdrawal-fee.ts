export type WithdrawalNetwork = "Ethereum" | "BSC" | "Stellar";

export interface WithdrawalFee {
  /** Fee amount, denominated in the withdrawal currency. */
  amount: number;
  currency: string;
  network?: WithdrawalNetwork;
  /**
   * True while the fee comes from the local placeholder schedule rather than a
   * real backend fee source — callers should surface it as an estimate.
   */
  isPlaceholder: boolean;
}

// TODO: replace PLACEHOLDER_FEES with the real backend fee schedule once an
// endpoint (e.g. GET /withdrawal-fees) exists. `flat` is a marked-estimate
// per-currency network fee and `pct` a percentage-of-amount component (0 for
// now). This exists only so the review screen stops showing a blanket "Free"
// that could later surprise users with a real charge.
const PLACEHOLDER_FEES: Record<string, { flat: number; pct: number }> = {
  ETH: { flat: 0.0005, pct: 0 },
  BNB: { flat: 0.0005, pct: 0 },
  USDC: { flat: 1, pct: 0 },
};

/**
 * Compute the withdrawal fee for a given currency/amount/network. Currently
 * returns a clearly-marked placeholder (`isPlaceholder: true`); the signature is
 * stable for a real percentage/network-tiered schedule dropping in later.
 */
export function calculateWithdrawalFee(
  currency: string,
  amount: string | number,
  network?: WithdrawalNetwork,
): WithdrawalFee {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  const schedule = PLACEHOLDER_FEES[currency];
  const flat = schedule?.flat ?? 0;
  const pct = schedule?.pct ?? 0;
  const variable =
    Number.isFinite(numericAmount) && numericAmount > 0
      ? (numericAmount * pct) / 100
      : 0;

  return { amount: flat + variable, currency, network, isPlaceholder: true };
}

/** Render a fee for display: "Free" for zero, otherwise the amount (+ estimate hint). */
export function formatWithdrawalFee(fee: WithdrawalFee): string {
  if (fee.amount <= 0) return "Free";
  const label = `${fee.amount} ${fee.currency}`;
  return fee.isPlaceholder ? `${label} (estimated)` : label;
}
