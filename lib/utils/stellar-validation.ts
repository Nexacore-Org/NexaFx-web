import { StrKey } from "@stellar/stellar-sdk";

export interface AddressValidationResult {
  valid: boolean;
  error?: string;
  networkType?: "mainnet" | "testnet";
}

const KNOWN_EXCHANGE_ADDRESSES = new Set<string>([
  "GBZ6YQXB7XKZPXPSGQQXPSY3WJZ3A3V2J5Y7TWKQFQFSTELLARMEMO",
]);

export const validateStellarAddress = (address: string): AddressValidationResult => {
  const normalized = address.trim();

  if (!normalized) {
    return { valid: false, error: "Wallet address is required" };
  }

  if (!normalized.startsWith("G")) {
    return { valid: false, error: "Stellar wallet addresses must start with G" };
  }

  if (normalized.length !== 56) {
    return { valid: false, error: "Stellar wallet addresses must be exactly 56 characters" };
  }

  if (!/^[A-Z2-7]+$/.test(normalized)) {
    return { valid: false, error: "Stellar wallet addresses must be valid base32 text" };
  }

  if (!StrKey.isValidEd25519PublicKey(normalized)) {
    return { valid: false, error: "Enter a valid Stellar public wallet address" };
  }

  return { valid: true, networkType: "mainnet" };
};

export const requiresMemo = (address: string): boolean => {
  return KNOWN_EXCHANGE_ADDRESSES.has(address.trim());
};
