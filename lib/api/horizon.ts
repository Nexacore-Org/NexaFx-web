/**
 * Stellar Horizon API client.
 *
 * Only the hash (a public on-chain identifier) is sent to Horizon; no user
 * data or session tokens are included in these requests.
 */

import { HORIZON_URL } from "@/lib/env";

// ---------------------------------------------------------------------------
// Zod-free lightweight validation helpers
// ---------------------------------------------------------------------------

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HorizonTransaction {
  /** Stellar ledger sequence number. */
  ledger: number;
  /** ISO-8601 timestamp from Horizon. */
  createdAt: string;
  /** Fee charged, in stroops (1 XLM = 10 000 000 stroops). */
  feeCharged: number;
  /** Number of operations in the transaction. */
  operationCount: number;
  /** Whether the transaction succeeded on the ledger. */
  successful: boolean;
  /** Stellar expert explorer URL for this transaction. */
  explorerUrl: string;
}

/** Result type distinguishing success, not-yet-confirmed, and hard errors. */
export type HorizonResult =
  | { status: "ok"; data: HorizonTransaction }
  | { status: "not_found" }
  | { status: "error"; message: string };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Convert stroops to XLM: 1 XLM = 10 000 000 stroops. */
export const STROOPS_PER_XLM = 10_000_000;

/** Timeout in milliseconds for Horizon requests. */
const HORIZON_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a stroops value (integer) to XLM string with 7 decimal places.
 *
 * @example
 * stroopsToXlm(1000000) // "0.1000000"
 * stroopsToXlm(10000000) // "1.0000000"
 */
export function stroopsToXlm(stroops: number): string {
  return (stroops / STROOPS_PER_XLM).toFixed(7);
}

/**
 * Build the Stellar expert explorer URL for a transaction hash.
 * Uses testnet explorer when HORIZON_URL points to testnet.
 */
export function explorerUrl(hash: string): string {
  const isTestnet = HORIZON_URL.includes("testnet");
  const network = isTestnet ? "testnet" : "public";
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

/**
 * Fetch on-chain details for a Stellar transaction hash from Horizon.
 *
 * - Returns `{ status: "not_found" }` for 404 (not yet confirmed on ledger).
 * - Returns `{ status: "error" }` for network failures or unexpected status
 *   codes, so callers can degrade gracefully without breaking the page.
 * - Only the hash is transmitted; no auth headers or user data are included.
 */
export async function fetchHorizonTransaction(
  hash: string,
): Promise<HorizonResult> {
  const url = `${HORIZON_URL}/transactions/${encodeURIComponent(hash)}`;

  let response: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HORIZON_TIMEOUT_MS);
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Network error reaching Horizon";
    return { status: "error", message };
  }

  if (response.status === 404) {
    return { status: "not_found" };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: `Horizon returned HTTP ${response.status}`,
    };
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    return { status: "error", message: "Invalid JSON from Horizon" };
  }

  if (!raw || typeof raw !== "object") {
    return { status: "error", message: "Unexpected Horizon response shape" };
  }

  const d = raw as Record<string, unknown>;

  const data: HorizonTransaction = {
    ledger: num(d.ledger),
    createdAt: str(d.created_at),
    feeCharged: num(d.fee_charged),
    operationCount: num(d.operation_count),
    successful: Boolean(d.successful),
    explorerUrl: explorerUrl(hash),
  };

  return { status: "ok", data };
}
