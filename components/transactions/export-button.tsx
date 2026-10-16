"use client";

import { useState } from "react";
import {
  toCsv,
  generateCsvFilename,
  downloadCsv,
  type CsvColumn,
} from "@/lib/csv";
import { formatMoney } from "@/lib/money";
import {
  fetchTransactions,
  type Transaction,
  type TransactionsQuery,
} from "@/lib/api/transactions";
import { notify } from "@/lib/notify";

// ---------------------------------------------------------------------------
// CSV column definitions
// ---------------------------------------------------------------------------

const CSV_COLUMNS: CsvColumn<Transaction>[] = [
  { header: "Reference ID", value: (tx) => tx.referenceId ?? tx.id },
  { header: "Transaction ID", value: (tx) => tx.id },
  { header: "Type", value: (tx) => tx.type },
  { header: "Status", value: (tx) => tx.status },
  {
    header: "Source Amount",
    value: (tx) => formatMoney(tx.sourceAmount, tx.sourceCurrency),
  },
  { header: "Source Currency", value: (tx) => tx.sourceCurrency },
  {
    header: "Destination Amount",
    value: (tx) =>
      tx.destinationAmount !== undefined && tx.destinationCurrency
        ? formatMoney(tx.destinationAmount, tx.destinationCurrency)
        : "",
  },
  {
    header: "Destination Currency",
    value: (tx) => tx.destinationCurrency ?? "",
  },
  {
    header: "Rate",
    value: (tx) => (tx.rate !== undefined ? String(tx.rate) : ""),
  },
  {
    header: "Fee",
    value: (tx) =>
      tx.fee !== undefined
        ? `${formatMoney(tx.fee, tx.sourceCurrency)} ${tx.sourceCurrency}`
        : "",
  },
  { header: "Date", value: (tx) => tx.createdAt },
  {
    header: "Destination / Counterparty",
    value: (tx) => tx.counterparty ?? "",
  },
  { header: "Memo", value: (tx) => tx.memo ?? "" },
  { header: "Stellar Hash", value: (tx) => tx.hash ?? "" },
  { header: "Description", value: (tx) => tx.description ?? "" },
];

// ---------------------------------------------------------------------------
// Export logic
// ---------------------------------------------------------------------------

/** Maximum number of transactions to export to prevent enormous files. */
const EXPORT_CAP = 10_000;

async function exportTransactions(
  query: Omit<TransactionsQuery, "cursor" | "limit">,
  onProgress: (count: number) => void,
): Promise<Transaction[]> {
  const all: Transaction[] = [];
  let cursor: string | undefined;

  while (all.length < EXPORT_CAP) {
    const batch = await fetchTransactions({
      ...query,
      limit: 100,
      cursor,
    });

    all.push(...batch.transactions);
    onProgress(all.length);

    if (!batch.nextCursor || batch.transactions.length === 0) break;
    cursor = batch.nextCursor;
  }

  return all.slice(0, EXPORT_CAP);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ExportButtonProps {
  /** Active filter query (type, status). Date range is passed for filename generation. */
  query?: Omit<TransactionsQuery, "cursor" | "limit">;
  /** ISO date range for CSV filename. */
  dateRange?: { from?: string; to?: string };
}

export function ExportButton({
  query = {},
  dateRange = {},
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setProgress(0);

    try {
      const transactions = await exportTransactions(query, (count) => {
        setProgress(count);
      });

      if (transactions.length === 0) {
        notify.info("No transactions found to export.");
        return;
      }

      const csvContent = toCsv(transactions, CSV_COLUMNS);
      const filename = generateCsvFilename(
        { dateFrom: dateRange.from, dateTo: dateRange.to },
        new Date(),
      );
      downloadCsv(csvContent, filename);
      notify.success(
        `Exported ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} to ${filename}`,
      );
    } catch (err) {
      notify.error(
        `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      aria-label={
        exporting
          ? `Exporting transactions… ${progress} rows so far`
          : "Export transactions as CSV"
      }
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {exporting ? (
        <>
          {/* Spinner */}
          <svg
            className="h-4 w-4 animate-spin text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Exporting{progress > 0 ? ` (${progress})` : "…"}</span>
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export CSV
        </>
      )}
    </button>
  );
}
