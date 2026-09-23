import { describe, it, expect, jest } from "@jest/globals";

jest.mock("../api-client", () => ({
  apiClient: jest.fn(),
}));

import { mapTransaction } from "@/lib/api/transactions";

describe("mapTransaction", () => {
  describe("type mapping and amountString sign prefixes", () => {
    it("maps a deposit and prefixes the amountString with +", () => {
      const result = mapTransaction({
        id: "tx-1",
        type: "deposit",
        amount: 100,
        currency: "NGN",
      });

      expect(result.type).toBe("Deposit");
      expect(result.amountString).toBe("+ 100 NGN");
    });

    it("maps a withdrawal (`withdrawal`) and prefixes the amountString with -", () => {
      const result = mapTransaction({
        id: "tx-2",
        type: "withdrawal",
        amount: 500,
        currency: "USD",
      });

      expect(result.type).toBe("Withdraw");
      expect(result.amountString).toBe("- 500 USD");
    });

    it("maps a withdrawal (`withdraw`) and prefixes the amountString with -", () => {
      const result = mapTransaction({
        id: "tx-3",
        type: "withdraw",
        amount: 50,
        currency: "EUR",
      });

      expect(result.type).toBe("Withdraw");
      expect(result.amountString).toBe("- 50 EUR");
    });

    it("maps a convert/conversion/exchange without a sign prefix", () => {
      for (const type of ["convert", "conversion", "exchange"]) {
        const result = mapTransaction({
          id: "tx-4",
          type,
          amount: 200,
          currency: "USDC",
        });

        expect(result.type).toBe("Convert");
        expect(result.amountString).toBe("200 USDC");
      }
    });

    it("preserves an unrecognized type string and omits a sign prefix", () => {
      const result = mapTransaction({
        id: "tx-5",
        type: "Refund",
        amount: 10,
        currency: "NGN",
      });

      expect(result.type).toBe("Refund");
      expect(result.amountString).toBe("10 NGN");
    });
  });

  describe("status normalization from varied-case backend input", () => {
    it.each([
      ["success", "Success"],
      ["SuCcEsS", "Success"],
      ["pending", "Pending"],
      ["PENDING", "Pending"],
      ["failed", "Failed"],
      ["Failed", "Failed"],
    ])("normalizes %s -> %s", (input, expected) => {
      const result = mapTransaction({ type: "deposit", status: input });
      expect(result.status).toBe(expected);
    });
  });

  describe("field fallbacks", () => {
    it("falls back to _id and snake_case date/currency fields", () => {
      const result = mapTransaction({
        _id: "tx-6",
        type: "deposit",
        amount: "42",
        created_at: "2026-01-01T10:00:00.000Z",
      });

      expect(result.id).toBe("tx-6");
      expect(result.amount).toBe(42);
      expect(result.rawDate).toBe("2026-01-01T10:00:00.000Z");
    });

    it("normalizes toCurrency, exchangeRate, toAmount and walletAddress aliases", () => {
      const result = mapTransaction({
        id: "tx-7",
        type: "convert",
        amount: 100,
        to_currency: "USD",
        exchange_rate: 1500,
        to_amount: 150000,
        wallet_address: "GABC",
      });

      expect(result.toCurrency).toBe("USD");
      expect(result.exchangeRate).toBe(1500);
      expect(result.toAmount).toBe(150000);
      expect(result.walletAddress).toBe("GABC");
    });

    it("resolves the reference from reference/transactionRef/transaction_ref", () => {
      expect(mapTransaction({ id: "a", reference: "REF-1" }).reference).toBe(
        "REF-1",
      );
      expect(
        mapTransaction({ id: "b", transactionRef: "REF-2" }).reference,
      ).toBe("REF-2");
      expect(
        mapTransaction({ id: "c", transaction_ref: "REF-3" }).reference,
      ).toBe("REF-3");
      expect(mapTransaction({ id: "d" }).reference).toBe("");
    });
  });
});
