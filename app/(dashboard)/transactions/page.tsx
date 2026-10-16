"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import {
  type TransactionFiltersState,
  parseFilters,
  serializeFilters,
} from "@/lib/transaction-filters";
import {
  type TransactionSortState,
  parseSortParams,
  serializeSortParams,
  sortTransactions,
} from "@/lib/transaction-sort";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Pagination control
// ---------------------------------------------------------------------------

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800"
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Next →
        </button>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Inner page (reads search params)
// ---------------------------------------------------------------------------

function TransactionsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive state from URL
  const urlFilters = parseFilters(Object.fromEntries(searchParams.entries()));
  const urlSort = parseSortParams(Object.fromEntries(searchParams.entries()));
  const urlPage = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

  // Local controlled filter state (debounced for search text)
  const [localFilters, setLocalFilters] =
    useState<TransactionFiltersState>(urlFilters);
  const debouncedSearch = useDebouncedValue(localFilters.search, 350);

  // Effective filters: use debounced search + rest of localFilters
  const effectiveFilters: TransactionFiltersState = {
    ...localFilters,
    search: debouncedSearch,
  };

  /** Push a new URL with updated params. page resets to 0 on filter changes. */
  function pushParams(
    filters: TransactionFiltersState,
    sort: TransactionSortState,
    page: number,
  ) {
    const params = new URLSearchParams();
    const f = serializeFilters(filters);
    const s = serializeSortParams(sort);
    Object.entries({ ...f, ...s }).forEach(([k, v]) => params.set(k, v));
    if (page > 0) params.set("page", String(page));
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleFiltersChange(next: TransactionFiltersState) {
    setLocalFilters(next);
    // Reset to page 1 when filters change
    pushParams(next, urlSort, 0);
  }

  function handleSortChange(next: TransactionSortState) {
    pushParams(effectiveFilters, next, urlPage);
  }

  function handlePageChange(next: number) {
    pushParams(effectiveFilters, urlSort, next);
  }

  const { data, isLoading, isError, isFetching, refetch } = useTransactions({
    limit: PAGE_SIZE,
    page: urlPage,
    type: effectiveFilters.type || undefined,
    status: effectiveFilters.status || undefined,
    currency: effectiveFilters.currency || undefined,
    search: effectiveFilters.search || undefined,
    dateFrom: effectiveFilters.dateFrom || undefined,
    dateTo: effectiveFilters.dateTo || undefined,
  });

  // Client-side sort on the current page (server sorting used when available)
  const sorted = data?.transactions
    ? sortTransactions(data.transactions, urlSort)
    : [];

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Complete transaction history and currency activity.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <TransactionFilters
          filters={localFilters}
          onChange={handleFiltersChange}
        />
      </div>

      {/* Table */}
      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Loading overlay hint when re-fetching with previous data */}
        {isFetching && !isLoading && (
          <p
            className="text-xs text-zinc-400 dark:text-zinc-500"
            aria-live="polite"
          >
            Refreshing…
          </p>
        )}

        <TransactionTable
          transactions={sorted}
          isLoading={isLoading}
          isError={isError}
          sort={urlSort}
          onSort={handleSortChange}
          onRetry={() => refetch()}
        />

        {!isLoading && !isError && (
          <Pagination
            page={urlPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export (Suspense wrapper required for useSearchParams in Next.js App Router)
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
              Transactions
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Loading your transactions…
            </p>
          </div>
        </div>
      }
    >
      <TransactionsInner />
    </Suspense>
  );
}
