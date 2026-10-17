import { describe, expect, it } from "vitest";
import {
  convertAmount,
  countDecimals,
  formatRate,
  fromUnits,
  toUnits,
  truncateToDecimals,
} from "@/lib/convert-amount";
import { getCurrency } from "@/lib/currencies";

describe("convert-amount", () => {
  it("converts decimal strings to units without losing precision", () => {
    const eth = getCurrency("ETH")!.decimals;
    expect(toUnits("1.000000000000000001", eth)).toBe(
      BigInt("1000000000000000001"),
    );
    expect(toUnits("0.5", 2)).toBe(BigInt(50));
    expect(toUnits(".5", 2)).toBe(BigInt(50));
  });

  it("rejects bad input and too many decimals", () => {
    expect(toUnits("", 2)).toBeNull();
    expect(toUnits(".", 2)).toBeNull();
    expect(toUnits("1.234", 2)).toBeNull();
    expect(toUnits("1e5", 2)).toBeNull();
    expect(toUnits("-1", 2)).toBeNull();
  });

  it("round trips through fromUnits and trims trailing zeros", () => {
    expect(fromUnits(BigInt(150), 2)).toBe("1.5");
    expect(fromUnits(BigInt(100), 2)).toBe("1");
    expect(fromUnits(BigInt(5), 7)).toBe("0.0000005");
  });

  it("counts and truncates decimals instead of rounding", () => {
    expect(countDecimals("1.2345")).toBe(4);
    expect(countDecimals("12")).toBe(0);
    expect(truncateToDecimals("1.999", 2)).toBe("1.99");
    expect(truncateToDecimals("1.999", 0)).toBe("1");
  });

  it("formats the rate line with the registry symbol", () => {
    expect(formatRate("1500", "USD", "NGN")).toBe("1 USD = ₦1,500.00");
    expect(formatRate("0.1", "NGN", "XLM")).toBe("1 NGN = 0.10 XLM");
  });

  it("converts with bigint math and cuts to the destination precision", () => {
    expect(convertAmount("10", 1500, 2, 2)).toBe("15000");
    expect(convertAmount("1", 0.00063, 2, 2)).toBe("0");
    expect(convertAmount("1000", 0.00063, 2, 2)).toBe("0.63");
    expect(convertAmount("0.5", 64210.55, 8, 2)).toBe("32105.27");
    expect(convertAmount("1", 1587.4, 6, 2)).toBe("1587.4");
  });

  it("returns null for unusable input", () => {
    expect(convertAmount("abc", 1500, 2, 2)).toBeNull();
    expect(convertAmount("1.234", 1500, 2, 2)).toBeNull();
    expect(convertAmount("1", 0, 2, 2)).toBeNull();
    expect(convertAmount("1", Number.NaN, 2, 2)).toBeNull();
  });
});
