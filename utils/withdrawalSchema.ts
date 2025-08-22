import * as Yup from "yup";

export const withdrawalValidationSchema = Yup.object({
  walletAddressOrUsername: Yup.string()
    .required("Wallet address or username is required")
    .min(3, "Must be at least 3 characters")
    .test(
      "valid-format",
      "Invalid wallet address or username format",
      (value) => {
        if (!value) return false;

        // Check for Ethereum address pattern (0x followed by 40 hex characters)
        const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;
        // Check for username pattern (alphanumeric with underscores/hyphens)
        const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;

        return ethAddressPattern.test(value) || usernamePattern.test(value);
      }
    ),

  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .min(0.01, "Minimum amount is 0.01")
    .max(326447, "Amount exceeds available balance")
    .test("decimal-places", "Maximum 6 decimal places allowed", (value) => {
      if (!value) return true;
      const decimalPlaces = (value.toString().split(".")[1] || "").length;
      return decimalPlaces <= 6;
    }),
});
