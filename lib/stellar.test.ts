import { describe, expect, it } from "vitest";
import {
  isValidStellarAddress,
  isValidMemo,
  truncateAddress,
  calculateStrKeyChecksum,
} from "./stellar";

describe("lib/stellar", () => {
  const validAddress1 = "GBFM7HJJ3WP4IN665NBXIESSUVIASZWUOTOZ4OEODUWTLNFVR5WEBJR7";
  const validAddress2 = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

  describe("isValidStellarAddress", () => {
    it("accepts valid 56-character Ed25519 public keys with correct checksum", () => {
      expect(isValidStellarAddress(validAddress1).valid).toBe(true);
      expect(isValidStellarAddress(validAddress2).valid).toBe(true);
    });

    it("rejects addresses not starting with G prefix", () => {
      const secretSeed = "SBFM7HJJ3WP4IN665NBXIESSUVIASZWUOTOZ4OEODUWTLNFVR5WEBJR7";
      const res = isValidStellarAddress(secretSeed);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("start with G prefix");
    });

    it("rejects addresses with invalid length", () => {
      expect(isValidStellarAddress("GABC").valid).toBe(false);
      expect(isValidStellarAddress(validAddress1 + "A").valid).toBe(false);
    });

    it("rejects lowercase letters (not in StrKey Base32)", () => {
      const lower = validAddress1.toLowerCase();
      const res = isValidStellarAddress(lower);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("G prefix");
    });

    it("rejects characters outside Base32 alphabet (0, 1, 8, 9)", () => {
      const withZero = validAddress1.slice(0, 10) + "0" + validAddress1.slice(11);
      const withOne = validAddress1.slice(0, 10) + "1" + validAddress1.slice(11);
      const withEight = validAddress1.slice(0, 10) + "8" + validAddress1.slice(11);
      const withNine = validAddress1.slice(0, 10) + "9" + validAddress1.slice(11);

      expect(isValidStellarAddress(withZero).valid).toBe(false);
      expect(isValidStellarAddress(withOne).valid).toBe(false);
      expect(isValidStellarAddress(withEight).valid).toBe(false);
      expect(isValidStellarAddress(withNine).valid).toBe(false);
    });

    it("rejects addresses with invalid CRC16 checksums", () => {
      // Swapping the last character corrupts the checksum
      const lastChar = validAddress1[55] === "7" ? "6" : "7";
      const corrupt = validAddress1.slice(0, 55) + lastChar;
      const res = isValidStellarAddress(corrupt);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("checksum");
    });
  });

  describe("isValidMemo", () => {
    describe("Type 0 (None / Null memo)", () => {
      it("requires empty string", () => {
        expect(isValidMemo(0, "").valid).toBe(true);
        expect(isValidMemo("none", "").valid).toBe(true);
        expect(isValidMemo(0, "anything").valid).toBe(false);
      });
    });

    describe("Type 1 (Text memo)", () => {
      it("accepts text memos up to 28 bytes", () => {
        expect(isValidMemo(1, "invoice-1234").valid).toBe(true);
        expect(isValidMemo("text", "A".repeat(28)).valid).toBe(true);
      });

      it("rejects text memos exceeding 28 ASCII bytes", () => {
        expect(isValidMemo(1, "A".repeat(29)).valid).toBe(false);
      });

      it("properly measures multi-byte UTF-8 characters via TextEncoder byte length", () => {
        // Emojis like 🎉 take 4 bytes each in UTF-8
        // 7 * 4 = 28 bytes (valid)
        expect(isValidMemo(1, "🎉".repeat(7)).valid).toBe(true);
        // 8 * 4 = 32 bytes (exceeds 28 bytes, even though string.length is 16 UTF-16 code units)
        expect(isValidMemo(1, "🎉".repeat(8)).valid).toBe(false);
      });
    });

    describe("Type 2 (ID memo)", () => {
      it("accepts valid decimal uint64 values", () => {
        expect(isValidMemo(2, "0").valid).toBe(true);
        expect(isValidMemo("id", "1234567890").valid).toBe(true);
        expect(isValidMemo(2, "18446744073709551615").valid).toBe(true); // 2^64 - 1
      });

      it("rejects negative numbers or non-decimal digits", () => {
        expect(isValidMemo(2, "-1").valid).toBe(false);
        expect(isValidMemo(2, "abc").valid).toBe(false);
        expect(isValidMemo(2, "12.34").valid).toBe(false);
      });

      it("rejects numbers exceeding uint64 maximum", () => {
        expect(isValidMemo(2, "18446744073709551616").valid).toBe(false);
        expect(isValidMemo(2, "9999999999999999999999999999").valid).toBe(false);
      });

      it("rejects 64 hex characters when not a decimal uint64", () => {
        // Old buggy behavior expected 64 hex chars
        const hex64 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        expect(isValidMemo(2, hex64).valid).toBe(false);
      });
    });

    describe("Type 3 (Hash memo) and Type 4 (Return memo)", () => {
      const validHash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

      it("accepts exactly 64 hexadecimal characters (32 bytes)", () => {
        expect(isValidMemo(3, validHash).valid).toBe(true);
        expect(isValidMemo("hash", validHash.toUpperCase()).valid).toBe(true);
        expect(isValidMemo(4, validHash).valid).toBe(true);
        expect(isValidMemo("return", validHash).valid).toBe(true);
      });

      it("rejects non-64 hex strings", () => {
        expect(isValidMemo(3, "0123456789abcdef").valid).toBe(false); // too short
        expect(isValidMemo(3, validHash + "a").valid).toBe(false); // too long
        expect(isValidMemo(3, validHash.slice(0, 63) + "z").valid).toBe(false); // non-hex
      });
    });
  });

  describe("truncateAddress", () => {
    it("truncates long addresses correctly", () => {
      expect(truncateAddress(validAddress1, 4, 4)).toBe("GBFM...BJR7");
      expect(truncateAddress("SHORT")).toBe("SHORT");
    });
  });
});
