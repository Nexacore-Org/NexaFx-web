"use client";

import Link from "next/link";

import type { AdminTransaction } from "@/lib/api/admin";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportToCsv(transactions: AdminTransaction[]): void {
  const headers = [
    "id",
    "reference",
    "type",
    "amount",
    "currency",
    "status",
    "counterparty",
    "createdAt",
  ];
  const rows = transactions.map((t) =>
    [
      t.id,
      t.reference,
      t.type,
      t.amount,
      t.currency,
      t.status,
      t.counterparty ?? "",
      t.createdAt,
    ]
      .map(csvEscape)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
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
          Export CSV
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
                  {tx.createdAt
                    ? new Date(tx.createdAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
