import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_VALUES,
  DRAFT_STORAGE_KEY,
  buildConvertQuery,
  convertHref,
  hasConvertParams,
  loadDraft,
  parseConvertParams,
  resolveInitialValues,
  saveDraft,
} from "@/lib/convert-params";

afterEach(() => {
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("parseConvertParams", () => {
  it("accepts a valid deep link", () => {
    expect(
      parseConvertParams({ from: "NGN", to: "USD", amount: "50000" }),
    ).toEqual({ from: "NGN", to: "USD", amount: "50000" });
  });

  it("normalises case and reads URLSearchParams and arrays", () => {
    expect(parseConvertParams(new URLSearchParams("from=ngn&to=usd"))).toEqual({
      from: "NGN",
      to: "USD",
    });
    expect(parseConvertParams({ from: ["eur", "usd"] })).toEqual({
      from: "EUR",
    });
  });

  it("silently drops unknown currencies and bad amounts", () => {
    expect(
      parseConvertParams({ from: "DOGE", to: "??", amount: "abc" }),
    ).toEqual({});
    expect(parseConvertParams({ amount: "-5" })).toEqual({});
    expect(parseConvertParams({ amount: "0" })).toEqual({});
    expect(parseConvertParams({ amount: "1e9" })).toEqual({});
    expect(parseConvertParams({ amount: "9".repeat(200) })).toEqual({});
  });

  it("drops a destination that equals the source", () => {
    expect(parseConvertParams({ from: "USD", to: "usd" })).toEqual({
      from: "USD",
    });
  });

  it("checks amount decimals against the currency being spent", () => {
    expect(parseConvertParams({ from: "USD", amount: "1.234" })).toEqual({
      from: "USD",
    });
    expect(parseConvertParams({ from: "XLM", amount: "1.2345678" })).toEqual({
      from: "XLM",
      amount: "1.2345678",
    });
  });

  it("never throws on junk input", () => {
    expect(parseConvertParams(null)).toEqual({});
    expect(parseConvertParams(undefined)).toEqual({});
    expect(
      parseConvertParams({ from: 5, amount: {} } as unknown as Record<
        string,
        string
      >),
    ).toEqual({});
  });
});

describe("hasConvertParams", () => {
  it("is true when any key is present, even if invalid", () => {
    expect(hasConvertParams({ from: "nope" })).toBe(true);
    expect(hasConvertParams({ other: "1" })).toBe(false);
    expect(hasConvertParams(new URLSearchParams(""))).toBe(false);
  });
});

describe("resolveInitialValues precedence", () => {
  const draft = { from: "EUR", to: "GBP", amount: "5" };

  it("uses the draft when the URL has no convert params", () => {
    expect(resolveInitialValues({}, draft)).toEqual(draft);
  });

  it("lets URL params win over a stored draft", () => {
    expect(resolveInitialValues({ from: "NGN", to: "USD" }, draft)).toEqual({
      from: "NGN",
      to: "USD",
      amount: "",
    });
  });

  it("ignores the draft even when the URL params are all invalid", () => {
    expect(resolveInitialValues({ from: "bad" }, draft)).toEqual(
      DEFAULT_VALUES,
    );
  });

  it("falls back to defaults with neither", () => {
    expect(resolveInitialValues({}, null)).toEqual(DEFAULT_VALUES);
  });
});

describe("draft storage", () => {
  it("round trips a draft", () => {
    saveDraft({ from: "NGN", to: "USD", amount: "100" });
    expect(loadDraft()).toEqual({ from: "NGN", to: "USD", amount: "100" });
  });

  it("validates what it reads back", () => {
    window.sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ from: "DOGE", to: "USD", amount: "x" }),
    );
    expect(loadDraft()).toEqual({ to: "USD" });
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, "{not json");
    expect(loadDraft()).toBeNull();
  });

  it("does not throw when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => saveDraft(DEFAULT_VALUES)).not.toThrow();
    expect(loadDraft()).toBeNull();
  });
});

describe("links", () => {
  it("builds the query for the form and leaves empty amounts out", () => {
    expect(buildConvertQuery({ from: "NGN", to: "USD", amount: "" })).toBe(
      "from=NGN&to=USD",
    );
    expect(buildConvertQuery({ from: "NGN", to: "USD", amount: "50000" })).toBe(
      "from=NGN&to=USD&amount=50000",
    );
    expect(buildConvertQuery({ from: "USD", to: "NGN", amount: "1.234" })).toBe(
      "from=USD&to=NGN",
    );
  });

  it("builds a pair link for market cards", () => {
    expect(convertHref("NGN", "USD")).toBe("/convert?from=NGN&to=USD");
  });
});
