import { describe, it, expect, jest } from "@jest/globals";

jest.mock("@/lib/utils/stellar-validation", () => ({
  validateStellarAddress: jest.fn((address: string) => {
    const normalized = address.trim();
    if (!normalized) {
      return { valid: false, error: "Wallet address is required" };
    }
    if (!normalized.startsWith("G")) {
      return {
        valid: false,
        error: "Stellar wallet addresses must start with G",
      };
    }
    if (normalized.length !== 56) {
      return {
        valid: false,
        error: "Stellar wallet addresses must be exactly 56 characters",
      };
    }
    return { valid: true, networkType: "mainnet" };
  }),
  requiresMemo: jest.fn(() => false),
}));

import { createWithdrawalSchema } from "@/lib/validations/transactions";
import { parseBalanceAmount } from "@/lib/utils/balance";

const VALID_ADDRESS = "G" + "A".repeat(55);

type ValidationResult = {
  success: boolean;
  error?: {
    issues: Array<{ path: Array<string | number>; message: string }>;
  };
};

function validate(
  values: { walletAddress: string; amount: string },
  maxBalance?: number,
): ValidationResult {
  return createWithdrawalSchema(maxBalance).safeParse(
    values,
  ) as ValidationResult;
}

function messages(result: ValidationResult): string[] {
  return (result.error?.issues ?? []).map((issue) => issue.message);
}

describe("createWithdrawalSchema (validateForm)", () => {
  describe("wallet address validation", () => {
    it("rejects an empty address", () => {
      const result = validate({ walletAddress: "", amount: "100" });
      expect(result.success).toBe(false);
      expect(messages(result)).toContain("Wallet address is required");
    });

    it("rejects a too-short address", () => {
      const result = validate({ walletAddress: "GABC", amount: "100" });
      expect(result.success).toBe(false);
      expect(messages(result)).toContain(
        "Stellar wallet addresses must be exactly 56 characters",
      );
    });
  });

  describe("amount validation", () => {
    it("rejects an empty amount", () => {
      const result = validate({ walletAddress: VALID_ADDRESS, amount: "" });
      expect(result.success).toBe(false);
      expect(messages(result)).toContain("Amount is required");
    });

    it("rejects a non-numeric amount", () => {
      const result = validate({ walletAddress: VALID_ADDRESS, amount: "abc" });
      expect(result.success).toBe(false);
      expect(messages(result)).toContain("Amount must be greater than 0");
    });

    it("rejects a non-positive amount", () => {
      const result = validate({ walletAddress: VALID_ADDRESS, amount: "-5" });
      expect(result.success).toBe(false);
    });
  });

  describe("balance comparison", () => {
    it("rejects an amount that exceeds the available balance", () => {
      const result = validate(
        { walletAddress: VALID_ADDRESS, amount: "2000" },
        1000,
      );
      expect(result.success).toBe(false);
      expect(messages(result)).toContain("Amount exceeds available balance");
    });

    it("accepts an amount equal to the available balance", () => {
      const result = validate(
        { walletAddress: VALID_ADDRESS, amount: "1000" },
        1000,
      );
      expect(result.success).toBe(true);
    });

    it("skips the balance check when no balance is known yet", () => {
      const result = validate({
        walletAddress: VALID_ADDRESS,
        amount: "999999",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("balance-parsing regression (multiple thousands separators)", () => {
    it("locks in correct behavior for a balance string with more than one thousands separator", () => {
      // Regression for the single-occurrence `replace(",", "")` bug, which
      // truncated "1,234,567.89" to ~1234.57 and let over-balance amounts
      // through.
      const maxBalance = parseBalanceAmount("1,234,567.89");
      expect(maxBalance).toBe(1234567.89);

      expect(
        validate(
          { walletAddress: VALID_ADDRESS, amount: "1,234,568" },
          maxBalance,
        ).success,
      ).toBe(false);

      expect(
        validate(
          { walletAddress: VALID_ADDRESS, amount: "1,234,567" },
          maxBalance,
        ).success,
      ).toBe(true);
    });
  });
});