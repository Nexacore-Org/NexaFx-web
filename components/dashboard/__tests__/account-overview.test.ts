import {
  formatCurrency,
  resolveBalances,
} from "@/components/dashboard/account-overview";

describe("formatCurrency", () => {
  it("formats a standard positive amount", () => {
    const result = formatCurrency("1234.56", "USD");
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result).toContain("56");
  });

  it("formats a negative amount", () => {
    const result = formatCurrency("-500", "NGN");
    expect(result).toContain("500");
  });

  it("returns empty string for undefined amount", () => {
    expect(formatCurrency(undefined, "USD")).toBe("");
  });

  it("returns empty string for null amount", () => {
    expect(
      formatCurrency(null as unknown as string | number | undefined, "USD"),
    ).toBe("");
  });

  it("returns empty string for empty string amount", () => {
    expect(formatCurrency("", "USD")).toBe("");
  });

  it("handles numeric input", () => {
    const result = formatCurrency(100, "USD");
    expect(result).toContain("100");
  });

  it("returns original string for non-finite values", () => {
    const result = formatCurrency("abc", "USD");
    expect(result).toBe("abc");
  });

  it("strips currency symbols from string input", () => {
    const result = formatCurrency("$1,234.56", "USD");
    expect(result).toContain("1234");
  });
});

describe("formatCurrency memoization", () => {
  it("reuses a single Intl.NumberFormat instance per locale/currency pair", () => {
    const numberFormatSpy = jest.spyOn(Intl, "NumberFormat");

    try {
      formatCurrency("100", "USD");

      const constructionsAfterFirst = numberFormatSpy.mock.calls.length;

      formatCurrency("250", "USD");
      formatCurrency("1234.5", "USD");

      expect(numberFormatSpy.mock.calls.length - constructionsAfterFirst).toBe(
        0,
      );

      formatCurrency("100", "NGN");
      expect(numberFormatSpy.mock.calls.length - constructionsAfterFirst).toBe(
        1,
      );
    } finally {
      numberFormatSpy.mockRestore();
    }
  });

  it("produces identical output whether or not the formatter is cached", () => {
    const first = formatCurrency("1234.56", "USD");
    const second = formatCurrency("1234.56", "USD");
    expect(first).toBe(second);
    expect(first).toContain("1,234.56");
  });
});

describe("resolveBalances", () => {
  it("resolves NGN and USD from balance array", () => {
    const result = resolveBalances([
      { currency: "NGN", balance: "5000" },
      { currency: "USD", balance: "100" },
    ]);
    expect(result).toEqual({ ngn: "5000", usd: "100" });
  });

  it("handles case-insensitive currency codes", () => {
    const result = resolveBalances([
      { currency: "ngn", balance: "3000" },
      { currency: "usd", balance: "50" },
    ]);
    expect(result).toEqual({ ngn: "3000", usd: "50" });
  });

  it("returns empty strings for missing currencies", () => {
    const result = resolveBalances([{ currency: "EUR", balance: "200" }]);
    expect(result).toEqual({ ngn: "", usd: "" });
  });

  it("handles null balances", () => {
    expect(resolveBalances(null)).toEqual({ ngn: "", usd: "" });
  });

  it("handles undefined balances", () => {
    expect(resolveBalances(undefined)).toEqual({ ngn: "", usd: "" });
  });

  it("handles empty array", () => {
    expect(resolveBalances([])).toEqual({ ngn: "", usd: "" });
  });

  it("skips entries with missing currency", () => {
    const result = resolveBalances([
      { balance: "100" },
      { currency: "NGN", balance: "5000" },
    ]);
    expect(result).toEqual({ ngn: "5000", usd: "" });
  });
});
