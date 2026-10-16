import type { Transaction } from "@/lib/api/transactions";
import { compareAmounts } from "@/lib/money";

// ---------------------------------------------------------------------------
// Sort types
// ---------------------------------------------------------------------------

export type SortField = "date" | "amount" | "status";
export type SortDirection = "asc" | "desc";

export interface TransactionSortState {
  field: SortField;
  dir: SortDirection;
}

export const DEFAULT_SORT: TransactionSortState = {
  field: "date",
  dir: "desc",
};

// ---------------------------------------------------------------------------
// Parsing / serialisation
// ---------------------------------------------------------------------------

const VALID_FIELDS: SortField[] = ["date", "amount", "status"];
const VALID_DIRS: SortDirection[] = ["asc", "desc"];

/**
 * Parse `?sort=date&dir=desc` from `URLSearchParams` or a plain record.
 * Unknown values fall back to `DEFAULT_SORT`.
 */
export function parseSortParams(
  params: URLSearchParams | Record<string, string>,
): TransactionSortState {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) return params.get(key) ?? "";
    return params[key] ?? "";
  };

  const field = get("sort");
  const dir = get("dir");

  return {
    field: (VALID_FIELDS.includes(field as SortField)
      ? field
      : DEFAULT_SORT.field) as SortField,
    dir: (VALID_DIRS.includes(dir as SortDirection)
      ? dir
      : DEFAULT_SORT.dir) as SortDirection,
  };
}

/**
 * Serialise a `TransactionSortState` into URL params. If the state matches
 * the default, returns an empty object so the URL stays clean.
 */
export function serializeSortParams(
  s: TransactionSortState,
): Record<string, string> {
  if (s.field === DEFAULT_SORT.field && s.dir === DEFAULT_SORT.dir) return {};
  return { sort: s.field, dir: s.dir };
}

// ---------------------------------------------------------------------------
// Comparison helpers
// ---------------------------------------------------------------------------

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  completed: 1,
  failed: 2,
};

/**
 * Compare two transactions by the given sort field.
 *
 * Amount sorting notes:
 *  - Transactions in different currencies are NOT mixed. Within a sort pass we
 *    compare `sourceAmount` numerically. Cross-currency comparisons are
 *    intentionally undefined (secondary sort by date keeps them stable).
 *    This is documented here so future work can layer in converted values once
 *    exchange rates are available.
 */
function compareTransactions(
  a: Transaction,
  b: Transaction,
  field: SortField,
): number {
  switch (field) {
    case "date":
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    case "amount": {
      if (a.sourceCurrency === b.sourceCurrency) {
        return compareAmounts(a.sourceAmount, b.sourceAmount);
      }
      // Different currencies: fall back to stable secondary sort by date.
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    case "status": {
      const oa = STATUS_ORDER[a.status] ?? 99;
      const ob = STATUS_ORDER[b.status] ?? 99;
      return oa - ob;
    }
  }
}

/**
 * Sort a transaction array by the given `TransactionSortState`.
 * Returns a **new** array; the original is not mutated.
 */
export function sortTransactions(
  transactions: Transaction[],
  sort: TransactionSortState,
): Transaction[] {
  const multiplier = sort.dir === "asc" ? 1 : -1;
  return [...transactions].sort(
    (a, b) => multiplier * compareTransactions(a, b, sort.field),
  );
}

/**
 * Returns the next sort state when a column header is clicked:
 *  - First click on a new column → ascending
 *  - Clicking the active column → toggle direction
 */
export function toggleSort(
  current: TransactionSortState,
  field: SortField,
): TransactionSortState {
  if (current.field !== field) return { field, dir: "asc" };
  return { field, dir: current.dir === "asc" ? "desc" : "asc" };
}
