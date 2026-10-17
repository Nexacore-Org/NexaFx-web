import { getCurrency } from "@/lib/currencies";

/**
 * Decimal-string helpers for the Convert flow. Amounts stay as strings and are
 * compared as bigint "units" so 18-decimal assets (ETH) never lose precision.
 */

const AMOUNT_PATTERN = /^\d*\.?\d*$/;

/** True when the input only contains digits and at most one dot. */
export function isAmountInput(value: string): boolean {
  return AMOUNT_PATTERN.test(value);
}

/** Number of digits after the dot (0 when there is no dot). */
export function countDecimals(value: string): number {
  const dot = value.indexOf(".");
  return dot === -1 ? 0 : value.length - dot - 1;
}

/**
 * Converts a plain decimal string to integer units at the given precision.
 * Returns null when the string is not a finite, non-negative decimal or has
 * more decimal places than allowed.
 */
export function toUnits(value: string, decimals: number): bigint | null {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === ".") return null;
  if (!isAmountInput(trimmed)) return null;
  if (countDecimals(trimmed) > decimals) return null;

  const [whole, fraction = ""] = trimmed.split(".");
  const padded = fraction.padEnd(decimals, "0");
  return BigInt(`${whole === "" ? "0" : whole}${padded}`);
}

/** Inverse of toUnits, with trailing zeros removed ("1.50" -> "1.5"). */
export function fromUnits(units: bigint, decimals: number): string {
  const negative = units < BigInt(0);
  const digits = (negative ? -units : units)
    .toString()
    .padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, "");
  const body = fraction ? `${whole}.${fraction}` : whole;
  return negative ? `-${body}` : body;
}

/** Cuts extra decimal places off instead of rounding, so Max never overshoots. */
export function truncateToDecimals(value: string, decimals: number): string {
  if (!isAmountInput(value)) return "";
  const dot = value.indexOf(".");
  if (dot === -1) return value;
  if (decimals === 0) return value.slice(0, dot);
  return value.slice(0, dot + 1 + decimals);
}

/** Display formatting that always uses the registry decimals for the code. */
export function formatAmount(value: string | number, code: string): string {
  const currency = getCurrency(code);
  const decimals = currency?.decimals ?? 2;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Math.min(decimals, 2),
    maximumFractionDigits: decimals,
  }).format(numeric);
}

/** "1 USD = ₦1,500.00" style rate line. */
export function formatRate(rate: string, from: string, to: string): string {
  const toCurrency = getCurrency(to);
  const prefix =
    toCurrency && toCurrency.symbol.length === 1 ? toCurrency.symbol : "";
  const suffix = prefix ? "" : ` ${to}`;
  return `1 ${from} = ${prefix}${formatAmount(rate, to)}${suffix}`;
}

const RATE_SCALE = 18;

/**
 * Amount received for `amount` of the source currency at `rate` (units of the
 * destination per 1 source unit), cut down to the destination precision.
 * Returns null when the amount is not a valid decimal for the source currency
 * or the rate is not a positive finite number.
 */
export function convertAmount(
  amount: string,
  rate: number,
  fromDecimals: number,
  toDecimals: number,
): string | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const amountUnits = toUnits(amount, fromDecimals);
  if (amountUnits === null) return null;
  const scaledRate = BigInt(rate.toFixed(RATE_SCALE).replace(".", ""));
  const numerator = amountUnits * scaledRate * BigInt(10) ** BigInt(toDecimals);
  const denominator =
    BigInt(10) ** BigInt(fromDecimals) * BigInt(10) ** BigInt(RATE_SCALE);
  return fromUnits(numerator / denominator, toDecimals);
}
