import { z } from "zod";
import { validateStellarAddress } from "@/lib/utils/stellar-validation";
import {
  MAX_TRANSACTION_AMOUNT,
  MAX_AMOUNT_INPUT_LENGTH,
  formatMaxAmountMessage,
} from "@/lib/constants/limits";

// Shared cap applied on top of a schema's own "amount is required / must be
// positive" rules, so each caller keeps its own not-a-valid-amount message.
function withAmountCap<T extends z.ZodTypeAny>(field: T) {
  return field
    .refine(
      (val) => typeof val !== "string" || val.length <= MAX_AMOUNT_INPUT_LENGTH,
      {
        message: formatMaxAmountMessage(),
      },
    )
    .refine(
      (val) =>
        typeof val !== "string" ||
        isNaN(parseFloat(val)) ||
        parseFloat(val) <= MAX_TRANSACTION_AMOUNT,
      { message: formatMaxAmountMessage() },
    );
}

export const convertSchema = z.object({
  amount: withAmountCap(
    z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Enter a valid amount",
      }),
  ),
});

export const withdrawalSchema = z.object({
  walletAddress: z.string().superRefine((value, context) => {
    const result = validateStellarAddress(value);
    if (!result.valid) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error ?? "Enter a valid Stellar public wallet address",
      });
    }
  }),
  amount: withAmountCap(
    z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Amount must be greater than 0",
      }),
  ),
});

export type ConvertFormValues = z.infer<typeof convertSchema>;
export type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

// Wraps withdrawalSchema with a balance check so the same rule set powers
// both as-you-type validation and submit-time validation. maxBalance is
// omitted while balances are still loading, in which case the check is
// skipped rather than blocking the user on a false 0-balance read.
export function createWithdrawalSchema(maxBalance?: number) {
  return withdrawalSchema.superRefine((data, context) => {
    if (maxBalance === undefined) return;
    const amountNum = parseFloat(data.amount);
    if (!isNaN(amountNum) && amountNum > maxBalance) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount exceeds available balance",
        path: ["amount"],
      });
    }
  });
}
