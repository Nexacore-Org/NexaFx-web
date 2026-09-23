import { describe, it, expect } from "@jest/globals";
import { parseBalanceAmount } from "@/lib/utils/balance";

describe("parseBalanceAmount", () => {
  it("parses a plain decimal string", () => {
    expect(parseBalanceAmount("100.50")).toBe(100.5);
  });

  it("parses a balance with a single thousands separator", () => {
    expect(parseBalanceAmount("1,000")).toBe(1000);
  });

  it("parses a balance with multiple thousands separators without truncating", () => {
    expect(parseBalanceAmount("1,234,567.89")).toBe(1234567.89);
  });

  it("parses a large whole-currency balance", () => {
    expect(parseBalanceAmount("15,000,000.00")).toBe(15000000);
  });

  it("returns NaN for an empty string", () => {
    expect(parseBalanceAmount("")).toBeNaN();
  });
});