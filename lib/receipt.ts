/**
 * Receipt data mapping for NexaFx PDF receipts.
 *
 * This module contains pure data-mapping functions that are fully unit-testable
 * without any PDF renderer. The actual PDF generation is done in the
 * ReceiptButton component and loaded dynamically to avoid bloating the initial
 * page bundle.
 */

import { formatMoney } from "@/lib/money";
import { truncateAddress } from "@/lib/stellar";
import type { Transaction } from "@/lib/api/transactions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReceiptData {
  /** Application name shown at the top of the receipt. */
  appName: string;
  /** Transaction reference / ID. */
  referenceId: string;
  /** Formatted date string including timezone offset. */
  dateTime: string;
  /** Human-readable transaction type (e.g. "Conversion"). */
  type: string;
  /** Source amount with currency code, formatted to correct decimals. */
  sourceAmount: string;
  /** Destination amount with currency code, or null when not applicable. */
  destinationAmount: string | null;
  /** Exchange rate string, or null. */
  rate: string | null;
  /** Fee, if known. */
  fee: string | null;
  /** Transaction status (capitalised). */
  status: string;
  /** Truncated destination address / counterparty. */
  destination: string | null;
  /** On-chain hash, if present. */
  hash: string | null;
  /** Recipient / account holder name shown on the receipt. */
  userName: string;
  /** Suggested PDF filename. */
  filename: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  convert: "Conversion",
  deposit: "Deposit",
  withdraw: "Withdrawal",
  transfer: "Transfer",
};

/**
 * Format a date for display on the receipt, including the UTC offset so the
 * receipt is unambiguous across timezones.
 */
export function formatReceiptDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  // Get local timezone abbreviation + offset
  const parts = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).formatToParts(date);

  return parts.map((p) => p.value).join("");
}

/**
 * Derive a display destination from counterparty or hash fields.
 *
 * Stellar addresses are 56 chars — truncate to first 6 and last 6.
 * Other counterparty strings (e.g. bank account descriptions) are returned
 * as-is up to a max of 40 characters.
 */
export function formatDestination(
  counterparty?: string,
  hash?: string,
): string | null {
  if (counterparty) {
    // Looks like a Stellar address
    if (counterparty.length === 56 && counterparty.startsWith("G")) {
      return truncateAddress(counterparty, 6, 6);
    }
    return counterparty.length > 40
      ? counterparty.slice(0, 37) + "..."
      : counterparty;
  }
  if (hash) {
    return truncateAddress(hash, 8, 8);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main mapping function
// ---------------------------------------------------------------------------

/**
 * Map a `Transaction` + optional user name to a `ReceiptData` object.
 *
 * Only `completed` transactions should be offered a receipt; callers are
 * expected to guard that condition, but this function normalises gracefully
 * regardless.
 *
 * @param tx       The transaction to build a receipt for.
 * @param userName Display name of the logged-in user.
 * @returns        A fully populated `ReceiptData` ready to be rendered.
 */
export function buildReceiptData(
  tx: Transaction,
  userName: string,
): ReceiptData {
  const sourceAmount = `${formatMoney(tx.sourceAmount, tx.sourceCurrency)} ${tx.sourceCurrency}`;

  const destinationAmount =
    tx.destinationAmount !== undefined && tx.destinationCurrency
      ? `${formatMoney(tx.destinationAmount, tx.destinationCurrency)} ${tx.destinationCurrency}`
      : null;

  const rate =
    tx.destinationAmount !== undefined &&
    tx.destinationCurrency &&
    tx.sourceAmount > 0
      ? `1 ${tx.sourceCurrency} = ${formatMoney(tx.destinationAmount / tx.sourceAmount, tx.destinationCurrency)} ${tx.destinationCurrency}`
      : null;

  return {
    appName: "NexaFx",
    referenceId: tx.id,
    dateTime: formatReceiptDate(tx.createdAt),
    type: TYPE_LABELS[tx.type] ?? tx.type,
    sourceAmount,
    destinationAmount,
    rate,
    fee: null, // Fee field not yet in Transaction shape; extend when backend adds it.
    status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
    destination: formatDestination(tx.counterparty, tx.hash),
    hash: tx.hash ?? null,
    userName: userName || "NexaFx User",
    filename: `nexafx-receipt-${tx.id}.pdf`,
  };
}
