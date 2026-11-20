# Withdrawal & Deposit Security Review Checklist

Withdrawal and deposit flows move real user funds and are among the highest-risk surfaces in NexaFx. Reviewers should verify every item below before approving changes that touch deposit or withdrawal UI, state, or submission logic.

## 1. Address & Destination Validation
- **No hardcoded deposit addresses or fallback destinations:** Deposit addresses must come from verified per-user/per-session backend or SDK responses—never hardcoded constants or silent fallback addresses (e.g., avoiding hardcoded deposit address bugs in `components/dashboard/deposit.tsx`).
- **Format, network, and memo/tag checks:** Destination addresses and optional memo/destination tags are validated for the selected asset and network before submission, preventing cross-network or malformed-address losses.
- **No silent address mutation:** The destination address displayed to the user matches the exact value submitted to the backend/provider.

## 2. Amount & Input Length Validation
- **Numeric bounds & precision:** Amounts reject `NaN`, `Infinity`, zero/negative values, dust/below-minimum amounts, and values exceeding available balance or per-transaction/daily limits.
- **Decimal & overflow safety:** Currency precision/decimal places are enforced consistently without floating-point rounding drift or integer/bignumber overflow.
- **Input length limits:** Free-text or numeric string fields (addresses, memos, amounts, reference notes) enforce explicit maximum length and character constraints both client-side and server-side to prevent DoS, oversized payloads, or buffer/UI abuse.

## 3. Confirmation-Step Integrity (`WithdrawalReview` & Pre-Submit Gates)
- **Single source of truth at confirmation:** The review/confirmation screen (`WithdrawalReview` and related summary steps) renders the final, authoritative parameters—recipient address, network, asset, amount, fees, and net payout/receive amount.
- **No post-review drift:** Editing inputs or stale async state after rendering the confirmation summary either invalidates the confirmation or re-locks the final values before execution.
- **Double-submit / replay protection:** Submit actions disable or idempotency-guard in-flight requests so users cannot accidentally trigger duplicate withdrawals or deposits.

## 4. Fee Transparency & Calculation Accuracy
- **Exact fee parity:** Fees shown in `WithdrawalReview` and deposit summaries match the actual fee formula or quote applied during execution—no mismatched network fees, hidden spreads, or stale estimates.
- **Net vs. gross clarity:** Clearly distinguish whether fees are deducted from the entered amount or added on top, and verify the resulting net amount matches user expectations.

## 5. Authorization, Client Exposure & Error Handling
- **Server-side enforcement:** Client checks improve UX, but authorization, balance/limit checks, and fee/quote verification must also be enforced on the server/API boundary.
- **No secrets in client code:** Private keys, secret API keys, or internal endpoints never appear in client components or `NEXT_PUBLIC_*` variables.
- **Safe error messages:** Failed transactions surface clear, actionable user guidance without leaking stack traces, internal IDs, or sensitive account details.