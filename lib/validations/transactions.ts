import { z } from "zod";

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
    .min(1, "Wallet address is required")
    .min(10, "Please enter a valid wallet address"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
});

export type ConvertFormValues = z.infer<typeof convertSchema>;
export type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;
