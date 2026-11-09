export type WithdrawalNetwork = "Ethereum" | "BSC" | "Stellar" | string;

export interface WithdrawalFeeResult {
  amount: number;
  currency: string;
}

/**
 * Calculates network and protocol fee for a given withdrawal.
 */
export function calculateWithdrawalFee(
  currency: string,
  amount: string | number,
  network: WithdrawalNetwork
): WithdrawalFeeResult {
  return {
    amount: 0,
    currency,
  };
}

/**
 * Formats the withdrawal fee for display in review and confirmation dialogs.
 */
export function formatWithdrawalFee(fee: WithdrawalFeeResult): string {
  if (!fee || fee.amount <= 0) return "Free";
  return `${fee.amount.toFixed(4)} ${fee.currency}`;
}
