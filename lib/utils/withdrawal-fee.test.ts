import { calculateWithdrawalFee, formatWithdrawalFee } from "./withdrawal-fee";

describe("calculateWithdrawalFee", () => {
  it("returns a currency-specific placeholder fee for ETH", () => {
    const fee = calculateWithdrawalFee("ETH", "1.5", "Ethereum");
    expect(fee.currency).toBe("ETH");
    expect(fee.amount).toBe(0.0005);
    expect(fee.isPlaceholder).toBe(true);
  });

  it("returns a different fee for USDC (currency-specific variation)", () => {
    const usdc = calculateWithdrawalFee("USDC", "100", "Stellar");
    const eth = calculateWithdrawalFee("ETH", "100", "Ethereum");
    expect(usdc.amount).toBe(1);
    expect(usdc.amount).not.toBe(eth.amount);
  });

  it("defaults an unknown currency to a zero (free) placeholder", () => {
    expect(calculateWithdrawalFee("XYZ", "10").amount).toBe(0);
  });
});

describe("formatWithdrawalFee", () => {
  it("shows 'Free' for a zero fee", () => {
    expect(
      formatWithdrawalFee({ amount: 0, currency: "XYZ", isPlaceholder: true }),
    ).toBe("Free");
  });

  it("marks a non-zero placeholder fee as estimated", () => {
    expect(
      formatWithdrawalFee({ amount: 1, currency: "USDC", isPlaceholder: true }),
    ).toBe("1 USDC (estimated)");
  });
});
