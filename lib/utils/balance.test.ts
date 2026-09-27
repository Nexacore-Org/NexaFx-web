import { describe, expect, it } from "@jest/globals";
import { parseBalanceAmount } from "./balance";

describe("parseBalanceAmount (issue #812)", () => {
  it("parses a balance with a single thousands separator", () => {
    expect(parseBalanceAmount("1,234.56")).toBeCloseTo(1234.56);
  });

  it("parses a balance with two or more thousands separators without truncating", () => {
    // Regression: String.replace(",", "") only strips the first comma,
    // leaving "1234,567.89" → parseFloat → 1234.
    expect(parseBalanceAmount("1,234,567.89")).toBeCloseTo(1234567.89);
    expect(parseBalanceAmount("12,345,678.90")).toBeCloseTo(12345678.9);
  });

  it("handles balances without separators", () => {
    expect(parseBalanceAmount("100")).toBe(100);
    expect(parseBalanceAmount("0.00")).toBe(0);
  });
});
