export function isValidStellarAddress(value: string): {
  valid: boolean;
  reason?: string;
} {
  if (value.length !== 56) {
    return { valid: false, reason: "Address must be 56 characters" };
  }
  if (value[0] !== "G") {
    return { valid: false, reason: "Address must start with G prefix" };
  }
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 1; i < value.length; i++) {
    if (alphabet.indexOf(value[i]) === -1) {
      return { valid: false, reason: "Invalid character in address" };
    }
  }
  // NOTE: the character/length checks below are a lightweight shape check.
  // Full StrKey CRC16 validation requires @stellar/stellar-sdk; wire that up
  // before trusting a user-supplied address for real transfers.
  return { valid: true };
}

export function isValidMemo(
  type: number | string,
  value: string,
): { valid: boolean; reason?: string } {
  const typeNum = typeof type === "number" ? type : parseInt(type, 10);
  switch (typeNum) {
    case 0: // null memo
      return { valid: value === "" };
    case 1: // text memo, max 28 bytes
      return { valid: value.length <= 28 };
    case 2: // id memo, exactly 64 hex chars
      return { valid: /^[0-9a-fA-F]{64}$/.test(value) };
    case 3: // hash memo, exactly 64 hex chars
      return { valid: /^[0-9a-fA-F]{64}$/.test(value) };
    default:
      return { valid: false, reason: "Unknown memo type" };
  }
}

export function truncateAddress(address: string, head = 6, tail = 6): string {
  if (address.length <= head + tail) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}
