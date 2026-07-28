"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ListFilter } from "lucide-react";
import type { Anomaly, AnomalySeverity } from "@/lib/utils/anomaly-detection";

type Props = {
  anomalies: Anomaly[];
};

const severityOptions: Array<"all" | AnomalySeverity> = ["all", "high", "medium", "low"];

const severityClasses: Record<AnomalySeverity, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-700",
};

export function AnomalyList({ anomalies }: Props) {
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [severity, setSeverity] = useState<"all" | AnomalySeverity>("all");

  const visibleAnomalies = useMemo(
    () =>
      anomalies.filter((anomaly) => {
        if (reviewedIds.has(anomaly.transactionId)) return false;
        return severity === "all" || anomaly.severity === severity;
      }),
    [anomalies, reviewedIds, severity]
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Transaction Anomalies</h3>
          <p className="text-sm text-gray-500 mt-1">
            Client-side detection from recent admin transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-gray-400" />
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as "all" | AnomalySeverity)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            aria-label="Filter anomalies by severity"
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All severities" : option[0].toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visibleAnomalies.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-gray-500">
          No unreviewed anomalies match this filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleAnomalies.map((anomaly) => (
                <tr key={anomaly.transactionId} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 text-gray-900">{anomaly.userEmail}</td>
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {anomaly.currency} {anomaly.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-gray-600">{anomaly.reason}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityClasses[anomaly.severity]}`}>
                      {anomaly.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/transactions?search=${encodeURIComponent(anomaly.transactionId)}`}
                        className="text-sm font-semibold text-gray-900 underline-offset-4 hover:underline"
                      >
                        Review transaction
                      </Link>
                      <button
                        type="button"
                        onClick={() => setReviewedIds((current) => new Set(current).add(anomaly.transactionId))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Check className="h-4 w-4" />
                        Mark as reviewed
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
