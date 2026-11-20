"use client";

import Link from "next/link";
import AdminDate from "./admin-date";

import type { AdminTransaction } from "@/lib/api/admin";

import { downloadCsv, toCsv, type CsvColumn } from "@/lib/csv";

const CSV_KEYS = [
  "id",
  "reference",
  "type",
  "amount",
  "currency",
  "status",
  "counterparty",
  "createdAt",
] as const;

const CSV_COLUMNS: CsvColumn<AdminTransaction>[] = CSV_KEYS.map((key) => ({
  header: key,
  value: (t) => String(t[key] ?? ""),
}));

/** Build the CSV for the rows currently shown (#1220). */
export function buildTransactionsCsv(transactions: AdminTransaction[]): string {
  return toCsv(transactions, CSV_COLUMNS);
}

function exportToCsv(transactions: AdminTransaction[]): void {
  downloadCsv(buildTransactionsCsv(transactions), "transactions-this-page.csv");
}

export default function TransactionsTable({
  transactions,
}: {
  transactions: AdminTransaction[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={transactions.length === 0}
          onClick={() => exportToCsv(transactions)}
        >
          Export this page (CSV)
        </button>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Reference</th>
            <th className="py-2 text-left font-medium">Type</th>
            <th className="py-2 text-left font-medium">Amount</th>
            <th className="py-2 text-left font-medium">Status</th>
            <th className="py-2 text-left font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-muted-foreground">
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-2">
                  <Link
                    href={`/admin/transactions/${tx.id}`}
                    className="font-medium hover:underline"
                  >
                    {tx.reference}
                  </Link>
                </td>
                <td className="py-2">{tx.type}</td>
                <td className="py-2">
                  {tx.amount} {tx.currency}
                </td>
                <td className="py-2">{tx.status}</td>
                <td className="py-2">
                  <AdminDate value={tx.createdAt} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
