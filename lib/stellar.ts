/**
 * Stellar StrKey Base32 alphabet (RFC 4648, uppercase A-Z and digits 2-7).
 * Excludes 0, 1, 8, 9 and lowercase letters.
 */
const STRKEY_BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Maximum unsigned 64-bit integer (2^64 - 1).
 */
const MAX_UINT64 = 18446744073709551615n;

/**
 * Calculates the CRC16-XModem checksum (polynomial 0x1021, initial value 0x0000)
 * matching the canonical Stellar StrKey encoding specification.
 */
export function calculateStrKeyChecksum(buffer: Uint8Array): number {
  let crc = 0x0000;
  const polynomial = 0x1021;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i] << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc;
}

/**
 * Decodes an RFC 4648 unpadded Base32 string into a raw Uint8Array.
 */
export function decodeBase32(str: string): Uint8Array {
  let buffer = 0;
  let bitsLeft = 0;
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const val = STRKEY_BASE32_ALPHABET.indexOf(str[i]);
    if (val === -1) {
      throw new Error(`Invalid Base32 character: ${str[i]}`);
    }
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      out.push((buffer >> bitsLeft) & 0xff);
    }
  }
  return new Uint8Array(out);
}

/**
 * Validates a Stellar account address (G...).
 * Requires:
 * - Exactly 56 characters
 * - Starts with 'G' prefix (Ed25519 public key version byte 0x30)
 * - Conforms to Base32 alphabet: /^G[A-Z2-7]{55}$/
 * - Little-endian CRC16-XModem checksum matches the payload
 */
export function isValidStellarAddress(value: string): {
  valid: boolean;
  reason?: string;
} {
  if (typeof value !== "string" || value.length !== 56) {
    return { valid: false, reason: "Address must be 56 characters" };
  }
  if (!value.startsWith("G")) {
    return { valid: false, reason: "Address must start with G prefix" };
  }
  if (!/^G[A-Z2-7]{55}$/.test(value)) {
    return {
      valid: false,
      reason: "Invalid character in address (must be uppercase Base32 A-Z, 2-7)",
    };
  }

  try {
    const decoded = decodeBase32(value);
    if (decoded.length !== 35) {
      return { valid: false, reason: "Invalid decoded address length" };
    }
    // Version byte must be 0x30 (48 decimal, Ed25519 public key)
    if (decoded[0] !== 48) {
      return { valid: false, reason: "Invalid address version byte" };
    }
    const payload = decoded.subarray(0, 33);
    const expectedChecksum = decoded[33] | (decoded[34] << 8);
    const calculatedChecksum = calculateStrKeyChecksum(payload);
    if (expectedChecksum !== calculatedChecksum) {
      return { valid: false, reason: "Invalid address checksum" };
    }
    return { valid: true };
  } catch (err: any) {
    return { valid: false, reason: err.message || "Failed to decode address" };
  }
}

/**
 * Validates a Stellar transaction memo according to the protocol rules:
 * - Type 0 (None): Must be empty
 * - Type 1 (Text): Maximum 28 bytes measured via UTF-8 byte length (TextEncoder)
 * - Type 2 (ID): Unsigned 64-bit integer (decimal 0 to 18446744073709551615)
 * - Type 3 (Hash): Exactly 32 bytes (64 hex characters)
 * - Type 4 (Return): Exactly 32 bytes (64 hex characters)
 */
export function isValidMemo(
  type: number | string,
  value: string,
): { valid: boolean; reason?: string } {
  let t = type;
  if (typeof t === "string") {
    const lower = t.toLowerCase();
    if (lower === "none" || lower === "null") t = 0;
    else if (lower === "text") t = 1;
    else if (lower === "id") t = 2;
    else if (lower === "hash") t = 3;
    else if (lower === "return") t = 4;
    else t = parseInt(t, 10);
  }

  switch (t) {
    case 0:
      return {
        valid: value === "",
        reason: value === "" ? undefined : "Null memo must be empty",
      };
    case 1: {
      const bytes = new TextEncoder().encode(value).length;
      return {
        valid: bytes <= 28,
        reason: bytes <= 28 ? undefined : "Text memo exceeds 28 bytes limit",
      };
    }
    case 2: {
      if (!/^\d+$/.test(value)) {
        return {
          valid: false,
          reason: "ID memo must be an unsigned 64-bit integer",
        };
      }
      try {
        const n = BigInt(value);
        const valid = n >= 0n && n <= MAX_UINT64;
        return {
          valid,
          reason: valid ? undefined : "ID memo out of 64-bit unsigned integer range",
        };
      } catch {
        return { valid: false, reason: "Invalid ID memo format" };
      }
    }
    case 3:
    case 4: {
      const valid = /^[0-9a-fA-F]{64}$/.test(value);
      return {
        valid,
        reason:
          valid ? undefined : "Hash memo must be exactly 32 bytes (64 hex characters)",
      };
    }
    default:
      return { valid: false, reason: "Unknown memo type" };
  }
}

export function truncateAddress(address: string, head = 6, tail = 6): string {
  if (!address || address.length <= head + tail) return address || "";
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}
