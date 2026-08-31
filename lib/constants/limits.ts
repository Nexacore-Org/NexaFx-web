/**
 * Client-side guardrails for currency-amount inputs (Deposit, Withdraw, Convert).
 *
 * These are deliberately generous ceilings, not real account/withdrawal limits
 * (those are enforced server-side and vary by KYC tier/currency). Their only job
 * is to stop obviously malformed or extreme values — e.g. a pasted string of 40
 * digits, or a number far beyond any realistic personal transaction — from ever
 * reaching the API.
 */

/** Highest numeric amount a single transaction input will accept. */
export const MAX_TRANSACTION_AMOUNT = 1_000_000_000;

/** Longest raw string a single amount input will accept (digits + one decimal point). */
export const MAX_AMOUNT_INPUT_LENGTH = 15;

export function formatMaxAmountMessage(
  max: number = MAX_TRANSACTION_AMOUNT,
): string {
  return `Amount cannot exceed ${max.toLocaleString()}`;
}
