"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { CurrencyIcon } from "@/components/shared/currency-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Transaction } from "@/lib/api/transactions";
import {
  type SortField,
  type TransactionSortState,
  DEFAULT_SORT,
  toggleSort,
} from "@/lib/transaction-sort";

// ---------------------------------------------------------------------------
// Column header (sortable)
// ---------------------------------------------------------------------------

interface SortableHeadProps {
  field: SortField;
  label: string;
  sort: TransactionSortState;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHead({
  field,
  label,
  sort,
  onSort,
  className = "",
}: SortableHeadProps) {
  const isActive = sort.field === field;
  const ariaSort = isActive
    ? sort.dir === "asc"
      ? ("ascending" as const)
      : ("descending" as const)
    : ("none" as const);

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-4 py-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 ${
          isActive ? "text-zinc-900 dark:text-zinc-100" : ""
        }`}
      >
        {label}
        <SortIcon active={isActive} dir={sort.dir} />
      </button>
    </th>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-3.5 w-3.5 ${active ? "opacity-100" : "opacity-30"}`}
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      {active && dir === "asc" ? (
        <path d="M8 3l5 6H3z" />
      ) : active && dir === "desc" ? (
        <path d="M8 13l5-6H3z" />
      ) : (
        <>
          <path d="M8 3l5 6H3z" opacity="0.6" />
          <path d="M8 13l5-6H3z" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<string, { className: string; label: string }> = {
  completed: {
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    label: "Completed",
  },
  pending: {
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    label: "Pending",
  },
  failed: {
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    label: "Failed",
  },
};

// ---------------------------------------------------------------------------
// Type config
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  string,
  { label: string; sign: string; colorClass: string; iconPath: string }
> = {
  convert: {
    label: "Convert",
    sign: "",
    colorClass:
      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
    iconPath: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
  },
  deposit: {
    label: "Deposit",
    sign: "+",
    colorClass:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
    iconPath: "M19 14l-7 7m0 0l-7-7m7 7V3",
  },
  withdraw: {
    label: "Withdraw",
    sign: "-",
    colorClass:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
    iconPath: "M5 10l7-7m0 0l7 7m-7-7v18",
  },
  transfer: {
    label: "Transfer",
    sign: "-",
    colorClass:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
    iconPath: "M14 5l7 7m0 0l-7 7m7-7H3",
  },
};

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function TransactionTableRow({ tx }: { tx: Transaction }) {
  const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.convert;
  const badge = STATUS_BADGE[tx.status] ?? STATUS_BADGE.completed;

  const date = new Date(tx.createdAt);
  const formattedDate = !isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : tx.createdAt;

  const primaryTitle =
    tx.description ??
    (tx.type === "convert" && tx.destinationCurrency
      ? `Convert ${tx.sourceCurrency} → ${tx.destinationCurrency}`
      : `${cfg.label} ${tx.sourceCurrency}`);

  return (
    <tr className="group border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/60 dark:border-zinc-800 dark:hover:bg-zinc-800/40">
      {/* Date */}
      <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
        <time dateTime={tx.createdAt}>{formattedDate}</time>
      </td>

      {/* Type + description */}
      <td className="px-4 py-3">
        <Link
          href={`/transactions/${tx.id}`}
          className="flex min-w-0 items-center gap-3"
          aria-label={`${primaryTitle}, status ${tx.status}`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.colorClass}`}
            aria-hidden="true"
          >
            <svg
              className="h-4 w-4 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={cfg.iconPath} />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
              {primaryTitle}
            </p>
            {tx.counterparty && (
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {tx.counterparty}
              </p>
            )}
          </div>
        </Link>
      </td>

      {/* Amount */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <CurrencyIcon code={tx.sourceCurrency} />
          <span>
            {cfg.sign}
            {formatMoney(tx.sourceAmount, tx.sourceCurrency)}
          </span>
          <span className="ml-0.5 text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {tx.sourceCurrency}
          </span>
        </div>
        {tx.destinationAmount !== undefined && tx.destinationCurrency && (
          <p className="mt-0.5 text-right text-xs text-zinc-500 dark:text-zinc-400">
            ≈ {formatMoney(tx.destinationAmount, tx.destinationCurrency)}{" "}
            {tx.destinationCurrency}
          </p>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-right">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Mobile card view
// ---------------------------------------------------------------------------

function TransactionCard({ tx }: { tx: Transaction }) {
  const cfg = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.convert;
  const badge = STATUS_BADGE[tx.status] ?? STATUS_BADGE.completed;

  const date = new Date(tx.createdAt);
  const formattedDate = !isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : tx.createdAt;

  const primaryTitle =
    tx.description ??
    (tx.type === "convert" && tx.destinationCurrency
      ? `Convert ${tx.sourceCurrency} → ${tx.destinationCurrency}`
      : `${cfg.label} ${tx.sourceCurrency}`);

  return (
    <Link
      href={`/transactions/${tx.id}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
      aria-label={`${primaryTitle}, status ${tx.status}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.colorClass}`}
          aria-hidden="true"
        >
          <svg
            className="h-5 w-5 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={cfg.iconPath} />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
              {primaryTitle}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {tx.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <time dateTime={tx.createdAt}>{formattedDate}</time>
            {tx.counterparty && (
              <>
                <span>•</span>
                <span className="truncate">{tx.counterparty}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="flex items-center justify-end gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
          <CurrencyIcon code={tx.sourceCurrency} />
          <span>
            {cfg.sign}
            {formatMoney(tx.sourceAmount, tx.sourceCurrency)}
          </span>
        </div>
        {tx.destinationAmount !== undefined && tx.destinationCurrency && (
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            ≈ {formatMoney(tx.destinationAmount, tx.destinationCurrency)}{" "}
            {tx.destinationCurrency}
          </div>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main TransactionTable
// ---------------------------------------------------------------------------

export interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  isError?: boolean;
  /** Called when a sortable column header is clicked. */
  sort?: TransactionSortState;
  onSort?: (sort: TransactionSortState) => void;
  onRetry?: () => void;
}

export function TransactionTable({
  transactions,
  isLoading = false,
  isError = false,
  sort = DEFAULT_SORT,
  onSort,
  onRetry,
}: TransactionTableProps) {
  function handleSort(field: SortField) {
    onSort?.(toggleSort(sort, field));
  }

  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div
          className="hidden sm:block"
          aria-label="Loading transactions"
          aria-busy="true"
        >
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="px-4 py-3">
                    <Skeleton width="100px" height="14px" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton width="32px" height="32px" />
                      <Skeleton width="140px" height="14px" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton width="80px" height="14px" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton width="64px" height="20px" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile skeleton */}
        <div
          className="space-y-3 sm:hidden"
          aria-label="Loading transactions"
          aria-busy="true"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/60"
            >
              <div className="flex items-center gap-3">
                <Skeleton width="40px" height="40px" />
                <div className="space-y-2">
                  <Skeleton width="140px" height="14px" />
                  <Skeleton width="90px" height="12px" />
                </div>
              </div>
              <Skeleton width="70px" height="14px" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <EmptyState
        variant="error"
        title="Failed to load transactions"
        description="We were unable to load your transactions. Please try again."
        retry={onRetry}
      />
    );
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        variant="empty"
        title="No transactions found"
        description="No transactions match your current filters. Try adjusting or clearing them."
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <SortableHead
                field="date"
                label="Date"
                sort={sort}
                onSort={handleSort}
                className="w-44"
              />
              <th
                scope="col"
                className="px-4 py-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400"
              >
                Description
              </th>
              <SortableHead
                field="amount"
                label="Amount"
                sort={sort}
                onSort={handleSort}
                className="text-right"
              />
              <SortableHead
                field="status"
                label="Status"
                sort={sort}
                onSort={handleSort}
                className="text-right"
              />
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <TransactionTableRow key={tx.id} tx={tx} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div
        className="space-y-3 sm:hidden"
        role="feed"
        aria-label="Transactions list"
      >
        {transactions.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} />
        ))}
      </div>
    </>
  );
}
