export interface FeeEstimate {
  transactionType: "Convert" | "Withdraw";
  inputAmount: number;
  inputCurrency: string;
  platformFee: number;
  platformFeePercent: number;
  networkFee?: number;
  totalFee: number;
  amountAfterFees: number;
  outputCurrency: string;
  outputAmount: number;
}

// This is a placeholder implementation.
// In a real application, this would fetch fee configuration from the backend.
const getFeeConfig = () => {
  return {
    convert: {
      platformFeePercent: 0.005, // 0.5%
    },
    withdraw: {
      platformFeePercent: 0.005, // 0.5%
      networkFee: 500, // Fixed network fee
    },
  };
};

export const estimateFee = (
  type: "Convert" | "Withdraw",
  amount: number,
  fromCurrency: string,
  toCurrency?: string,
): FeeEstimate => {
  const feeConfig = getFeeConfig();
  const platformFeePercent = feeConfig[type.toLowerCase()].platformFeePercent;
  const platformFee = amount * platformFeePercent;
  const networkFee = type === "Withdraw" ? feeConfig.withdraw.networkFee : 0;
  const totalFee = platformFee + (networkFee || 0);
  const amountAfterFees = amount - totalFee;

  // Placeholder for currency conversion
  const exchangeRate = 0.00065; // Example rate
  const outputAmount =
    type === "Convert" ? amountAfterFees * exchangeRate : amountAfterFees;
  const outputCurrency = toCurrency || fromCurrency;

  return {
    transactionType: type,
    inputAmount: amount,
    inputCurrency: fromCurrency,
    platformFee,
    platformFeePercent,
    networkFee,
    totalFee,
    amountAfterFees,
    outputCurrency,
    outputAmount,
  };
};
