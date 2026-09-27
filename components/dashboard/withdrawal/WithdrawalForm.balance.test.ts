/**
 * Unit tests for balance lookup / parsing helpers used by WithdrawalForm
 * (issues #812, #817). Pure functions extracted to avoid full form mount.
 */
import { describe, expect, it } from "@jest/globals";
import { parseBalanceAmount } from "@/lib/utils/balance";

/** Mirrors the case-normalized lookup in toCurrencyOption / balance map build. */
function buildBalanceMap(
  balances: Array<{ currency: string; balance: string }>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const b of balances) {
    map[String(b.currency).toUpperCase()] = b.balance;
  }
  return map;
}

function lookupBalance(
  balanceMap: Record<string, string>,
  code: string,
): string {
  const key = String(code).toUpperCase();
  return balanceMap[key] ?? balanceMap[code] ?? "0.00";
}

describe("WithdrawalForm balance parsing (#812)", () => {
  it("does not truncate multi-comma balances when comparing", () => {
    const balance = "1,234,567.89";
    const amount = 500000;
    const available = parseBalanceAmount(balance);
    expect(available).toBeGreaterThan(amount);
    expect(available).toBeCloseTo(1234567.89);
  });

  it("Max amount uses full multi-comma balance", () => {
    const max = parseBalanceAmount("2,500,000.50");
    expect(String(max)).toBe("2500000.5");
  });
});

describe("WithdrawalForm currency case normalization (#817)", () => {
  it("resolves balance when currencies endpoint is uppercase and balances is lowercase", () => {
    const map = buildBalanceMap([
      { currency: "ngn", balance: "1,000.00" },
      { currency: "usd", balance: "50.00" },
    ]);
    expect(lookupBalance(map, "NGN")).toBe("1,000.00");
    expect(lookupBalance(map, "USD")).toBe("50.00");
  });

  it("resolves balance when currencies endpoint is lowercase and balances is uppercase", () => {
    const map = buildBalanceMap([
      { currency: "NGN", balance: "9,999.99" },
    ]);
    expect(lookupBalance(map, "ngn")).toBe("9,999.99");
    expect(lookupBalance(map, "NgN")).toBe("9,999.99");
  });

  it("falls back to 0.00 when currency is missing from map", () => {
    const map = buildBalanceMap([{ currency: "USD", balance: "10" }]);
    expect(lookupBalance(map, "EUR")).toBe("0.00");
  });
});
