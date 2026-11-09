import { describe, expect, it } from "vitest";
import {
  validateStellarAddress,
  requiresMemo,
  KNOWN_EXCHANGES_REQUIRING_MEMO,
} from "./stellar-validation";

describe("lib/utils/stellar-validation", () => {
  const validAddress = "GBFM7HJJ3WP4IN665NBXIESSUVIASZWUOTOZ4OEODUWTLNFVR5WEBJR7";

  describe("validateStellarAddress", () => {
    it("accepts a valid 56-character Stellar public key starting with G", () => {
      const res = validateStellarAddress(validAddress);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("rejects empty or falsy inputs", () => {
      // @ts-expect-error test invalid input type
      expect(validateStellarAddress(null).valid).toBe(false);
      expect(validateStellarAddress("").valid).toBe(false);
    });

    it("rejects addresses with incorrect length", () => {
      const res = validateStellarAddress("GBFM7HJJ3WP4IN665");
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("56 characters");
    });

    it("rejects addresses without G prefix", () => {
      const invalidPrefix = "SBFM7HJJ3WP4IN665NBXIESSUVIASZWUOTOZ4OEODUWTLNFVR5WEBJR7";
      const res = validateStellarAddress(invalidPrefix);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("start with G prefix");
    });

    it("rejects addresses containing invalid characters", () => {
      // 56 chars, starts with G, but contains invalid character '?'
      const invalidChars = "G" + "?".repeat(55);
      const res = validateStellarAddress(invalidChars);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Invalid character");
    });
  });

  describe("requiresMemo", () => {
    it("returns true for known exchange addresses requiring a memo", () => {
      for (const exchangeAddr of KNOWN_EXCHANGES_REQUIRING_MEMO) {
        expect(requiresMemo(exchangeAddr)).toBe(true);
        expect(requiresMemo(exchangeAddr.toLowerCase())).toBe(true);
      }
    });

    it("returns false for regular individual user addresses", () => {
      expect(requiresMemo(validAddress)).toBe(false);
      expect(requiresMemo("GDEXAMPLEUSERWALLETWITHOUTMEMOREQUIREDXXXXXXXXXXXXXXXXX")).toBe(
        false
      );
    });

    it("returns false for empty or invalid inputs", () => {
      expect(requiresMemo("")).toBe(false);
      // @ts-expect-error test invalid input type
      expect(requiresMemo(null)).toBe(false);
    });
  });
});
