import { describe, expect, it } from "vitest";

import {
  parseLocalDate,
  validateEndDate,
  validateSchedule,
  validateStartDate,
} from "@/lib/api/schedules";

describe("schedules date helpers", () => {
  const baseNow = new Date(2026, 10, 10, 12, 0, 0); // Nov 10, 2026

  describe("parseLocalDate", () => {
    it("parses valid YYYY-MM-DD", () => {
      const parsed = parseLocalDate("2026-11-15");
      expect(parsed).not.toBeNull();
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(10); // 0-based month 10 is Nov
      expect(parsed?.getDate()).toBe(15);
    });

    it("rejects invalid formats and rollover dates", () => {
      expect(parseLocalDate("invalid")).toBeNull();
      expect(parseLocalDate("2026-02-30")).toBeNull();
      expect(parseLocalDate("2026-13-01")).toBeNull();
    });
  });

  describe("validateStartDate", () => {
    it("requires a start date", () => {
      expect(validateStartDate("", baseNow)).toBe("Choose a start date");
    });

    it("rejects invalid dates", () => {
      expect(validateStartDate("not-a-date", baseNow)).toBe("Enter a valid date");
    });

    it("rejects dates in the past or today", () => {
      expect(validateStartDate("2026-11-09", baseNow)).toBe(
        "Start date must be in the future",
      );
      expect(validateStartDate("2026-11-10", baseNow)).toBe(
        "Start date must be in the future",
      );
    });

    it("accepts strictly future dates", () => {
      expect(validateStartDate("2026-11-11", baseNow)).toBeNull();
      expect(validateStartDate("2026-12-01", baseNow)).toBeNull();
    });
  });

  describe("validateEndDate", () => {
    it("allows missing or empty end date", () => {
      expect(validateEndDate("2026-11-15", null, baseNow)).toBeNull();
      expect(validateEndDate("2026-11-15", "", baseNow)).toBeNull();
    });

    it("rejects invalid end dates", () => {
      expect(validateEndDate("2026-11-15", "not-a-date", baseNow)).toBe(
        "Enter a valid end date",
      );
    });

    it("rejects end date before start date", () => {
      expect(validateEndDate("2026-11-20", "2026-11-15", baseNow)).toBe(
        "End date cannot be before the start date",
      );
    });

    it("rejects end dates in the past", () => {
      expect(validateEndDate("2026-11-05", "2026-11-06", baseNow)).toBe(
        "End date must be in the future",
      );
    });

    it("accepts valid future end date on or after start date", () => {
      expect(validateEndDate("2026-11-15", "2026-11-20", baseNow)).toBeNull();
      expect(validateEndDate("2026-11-15", "2026-11-15", baseNow)).toBeNull();
    });
  });
});

describe("validateSchedule", () => {
  const baseNow = new Date(2026, 10, 10, 12, 0, 0);

  it("rejects missing or unknown currency codes", () => {
    const res = validateSchedule(
      {
        fromCurrency: "UNKNOWN",
        toCurrency: "USD",
        amount: "100",
        startDate: "2026-11-15",
        endDate: null,
      },
      baseNow,
    );
    expect(res.pair).toBe("Choose both currencies");
  });

  it("rejects identical from and to currencies", () => {
    const res = validateSchedule(
      {
        fromCurrency: "USD",
        toCurrency: "usd",
        amount: "100",
        startDate: "2026-11-15",
        endDate: null,
      },
      baseNow,
    );
    expect(res.pair).toBe("Choose two different currencies");
  });

  it("rejects malformed amounts (letters, scientific notation, negative, empty)", () => {
    const invalidAmounts = ["12abc", "1e3", "-5", "0", "0.00", "", ".", "abc"];
    for (const amount of invalidAmounts) {
      const res = validateSchedule(
        {
          fromCurrency: "USD",
          toCurrency: "NGN",
          amount,
          startDate: "2026-11-15",
          endDate: null,
        },
        baseNow,
      );
      expect(res.amount).toBe("Enter an amount greater than zero");
    }
  });

  it("rejects amounts exceeding currency decimal limits", () => {
    // USD has 2 decimals
    const res = validateSchedule(
      {
        fromCurrency: "USD",
        toCurrency: "NGN",
        amount: "10.123",
        startDate: "2026-11-15",
        endDate: null,
      },
      baseNow,
    );
    expect(res.amount).toBe("Enter an amount greater than zero");
  });

  it("accepts valid decimal amounts matching currency precision", () => {
    const res = validateSchedule(
      {
        fromCurrency: "USD",
        toCurrency: "NGN",
        amount: "10.50",
        startDate: "2026-11-15",
        endDate: null,
      },
      baseNow,
    );
    expect(res.amount).toBeUndefined();
  });

  it("ignores end date validation when frequency is once", () => {
    const res = validateSchedule(
      {
        fromCurrency: "USD",
        toCurrency: "NGN",
        amount: "50",
        startDate: "2026-11-15",
        endDate: "2020-01-01", // Past date, would fail if recurring
        frequency: "once",
      },
      baseNow,
    );
    expect(res.endDate).toBeUndefined();
    expect(Object.keys(res)).toHaveLength(0);
  });

  it("validates end date when frequency is weekly or monthly", () => {
    const res = validateSchedule(
      {
        fromCurrency: "USD",
        toCurrency: "NGN",
        amount: "50",
        startDate: "2026-11-15",
        endDate: "2020-01-01",
        frequency: "monthly",
      },
      baseNow,
    );
    expect(res.endDate).toBe("End date cannot be before the start date");
  });
});
