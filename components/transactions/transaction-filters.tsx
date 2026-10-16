"use client";

import { useState } from "react";
import {
  type TransactionFiltersState,
  type DatePreset,
  EMPTY_FILTERS,
  applyDatePreset,
  validateDateRange,
  countActiveFilters,
  isFiltersEmpty,
} from "@/lib/transaction-filters";

const TRANSACTION_TYPES = [
  { value: "", label: "All types" },
  { value: "convert", label: "Convert" },
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
  { value: "transfer", label: "Transfer" },
] as const;

const TRANSACTION_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
] as const;

const CURRENCIES = ["", "NGN", "USD", "EUR", "USDC", "XLM", "BTC", "ETH"];

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

export interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onChange: (filters: TransactionFiltersState) => void;
}

export function TransactionFilters({
  filters,
  onChange,
}: TransactionFiltersProps) {
  const [dateError, setDateError] = useState<string | null>(null);

  function update(patch: Partial<TransactionFiltersState>) {
    const next = { ...filters, ...patch };

    // Validate date range whenever either date changes
    const error = validateDateRange(next.dateFrom, next.dateTo);
    setDateError(error);

    // Only call onChange when the date range is valid (or incomplete)
    if (!error) onChange(next);
  }

  function applyPreset(preset: DatePreset) {
    const range = applyDatePreset(preset);
    setDateError(null);
    onChange({ ...filters, ...range });
  }

  function removeFilter(key: keyof TransactionFiltersState) {
    setDateError(null);
    onChange({ ...filters, [key]: "" });
  }

  function clearAll() {
    setDateError(null);
    onChange(EMPTY_FILTERS);
  }

  const activeCount = countActiveFilters(filters);

  return (
    <div className="space-y-3">
      {/* Search + row of selects */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Free-text search */}
        <div className="lg:col-span-2">
          <label
            htmlFor="tx-search"
            className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Search
          </label>
          <input
            id="tx-search"
            type="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Description, counterparty, ID…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Type */}
        <div>
          <label
            htmlFor="tx-type"
            className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Type
          </label>
          <select
            id="tx-type"
            value={filters.type}
            onChange={(e) =>
              update({
                type: e.target.value as TransactionFiltersState["type"],
              })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {TRANSACTION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="tx-status"
            className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Status
          </label>
          <select
            id="tx-status"
            value={filters.status}
            onChange={(e) =>
              update({
                status: e.target.value as TransactionFiltersState["status"],
              })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {TRANSACTION_STATUSES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date row */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Currency */}
        <div>
          <label
            htmlFor="tx-currency"
            className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Currency
          </label>
          <select
            id="tx-currency"
            value={filters.currency}
            onChange={(e) => update({ currency: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c || "All currencies"}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label
            htmlFor="tx-date-from"
            className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            From
          </label>
          <input
            id="tx-date-from"
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Date to */}
        <div>
          <label
            htmlFor="tx-date-to"
            className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            To
          </label>
          <input
            id="tx-date-to"
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Quick presets */}
        <div className="flex items-end gap-1">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => applyPreset(p.value)}
              className="flex-1 rounded-lg border border-zinc-300 px-2 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date error */}
      {dateError && (
        <p
          role="alert"
          className="text-xs font-medium text-red-600 dark:text-red-400"
        >
          {dateError}
        </p>
      )}

      {/* Active filter chips */}
      {!isFiltersEmpty(filters) && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.search && (
            <FilterChip
              label={`Search: "${filters.search}"`}
              onRemove={() => removeFilter("search")}
            />
          )}
          {filters.type && (
            <FilterChip
              label={`Type: ${filters.type}`}
              onRemove={() => removeFilter("type")}
            />
          )}
          {filters.status && (
            <FilterChip
              label={`Status: ${filters.status}`}
              onRemove={() => removeFilter("status")}
            />
          )}
          {filters.currency && (
            <FilterChip
              label={`Currency: ${filters.currency}`}
              onRemove={() => removeFilter("currency")}
            />
          )}
          {filters.dateFrom && (
            <FilterChip
              label={`From: ${filters.dateFrom}`}
              onRemove={() => removeFilter("dateFrom")}
            />
          )}
          {filters.dateTo && (
            <FilterChip
              label={`To: ${filters.dateTo}`}
              onRemove={() => removeFilter("dateTo")}
            />
          )}

          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Clear all ({activeCount})
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-100"
      >
        ×
      </button>
    </span>
  );
}
