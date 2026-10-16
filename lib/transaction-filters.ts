import type {
  TransactionType,
  TransactionStatus,
} from "@/lib/api/transactions";

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export interface TransactionFiltersState {
  /** Free-text search against description, counterparty or ID. */
  search: string;
  type: TransactionType | "";
  status: TransactionStatus | "";
  currency: string;
  /** ISO date string, e.g. "2024-01-01" */
  dateFrom: string;
  /** ISO date string, e.g. "2024-01-31" */
  dateTo: string;
}

export const EMPTY_FILTERS: TransactionFiltersState = {
  search: "",
  type: "",
  status: "",
  currency: "",
  dateFrom: "",
  dateTo: "",
};

/** Returns true when all filters are at their default (empty) values. */
export function isFiltersEmpty(f: TransactionFiltersState): boolean {
  return (
    f.search === "" &&
    f.type === "" &&
    f.status === "" &&
    f.currency === "" &&
    f.dateFrom === "" &&
    f.dateTo === ""
  );
}

// ---------------------------------------------------------------------------
// Quick presets
// ---------------------------------------------------------------------------

export type DatePreset = "7d" | "30d" | "90d";

export function applyDatePreset(
  preset: DatePreset,
  now = new Date(),
): { dateFrom: string; dateTo: string } {
  const days = { "7d": 7, "30d": 30, "90d": 90 }[preset];
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: now.toISOString().slice(0, 10),
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Returns a human-readable error message when `dateFrom` is after `dateTo`,
 * or `null` when the range is valid.
 */
export function validateDateRange(
  dateFrom: string,
  dateTo: string,
): string | null {
  if (!dateFrom || !dateTo) return null;
  return dateFrom > dateTo ? "Start date must be on or before end date." : null;
}

// ---------------------------------------------------------------------------
// Serialisation / parsing (URL ↔ state)
// ---------------------------------------------------------------------------

const VALID_TYPES: TransactionType[] = [
  "convert",
  "deposit",
  "withdraw",
  "transfer",
];
const VALID_STATUSES: TransactionStatus[] = ["completed", "pending", "failed"];

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * Parse a `URLSearchParams` (or plain `Record<string, string>`) into a
 * `TransactionFiltersState`, ignoring any unknown or invalid values.
 */
export function parseFilters(
  params: URLSearchParams | Record<string, string>,
): TransactionFiltersState {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) return params.get(key) ?? "";
    return params[key] ?? "";
  };

  const type = get("type");
  const status = get("status");
  const dateFrom = get("dateFrom");
  const dateTo = get("dateTo");

  return {
    search: get("search"),
    type: (VALID_TYPES.includes(type as TransactionType) ? type : "") as
      TransactionType | "",
    status: (VALID_STATUSES.includes(status as TransactionStatus)
      ? status
      : "") as TransactionStatus | "",
    currency: get("currency").toUpperCase(),
    dateFrom: isIsoDate(dateFrom) ? dateFrom : "",
    dateTo: isIsoDate(dateTo) ? dateTo : "",
  };
}

/**
 * Serialise a `TransactionFiltersState` into a plain object suitable for
 * `URLSearchParams`. Empty / default values are omitted so the URL stays
 * clean.
 */
export function serializeFilters(
  f: TransactionFiltersState,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.search) out.search = f.search;
  if (f.type) out.type = f.type;
  if (f.status) out.status = f.status;
  if (f.currency) out.currency = f.currency;
  if (f.dateFrom) out.dateFrom = f.dateFrom;
  if (f.dateTo) out.dateTo = f.dateTo;
  return out;
}

/**
 * Returns the number of active (non-empty) filter fields.
 */
export function countActiveFilters(f: TransactionFiltersState): number {
  return [f.search, f.type, f.status, f.currency, f.dateFrom, f.dateTo].filter(
    Boolean,
  ).length;
}
