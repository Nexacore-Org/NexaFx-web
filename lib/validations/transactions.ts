import { z } from "zod";
import { validateStellarAddress } from "@/lib/utils/stellar-validation";

export const convertSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Enter a valid amount",
    }),
});

export const withdrawalSchema = z.object({
  walletAddress: z
    .string()
    .superRefine((value, context) => {
      const result = validateStellarAddress(value);
      if (!result.valid) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error ?? "Enter a valid Stellar public wallet address",
        });
      }
    }),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
});

export type ConvertFormValues = z.infer<typeof convertSchema>;
export type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;
