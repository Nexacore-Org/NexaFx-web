"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import type { RateAlert } from "@/lib/api/alerts";

type Props = {
  alerts: RateAlert[];
  onDelete: (id: string) => Promise<void>;
  deletingId?: string | null;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function conditionLabel(alert: RateAlert): string {
  const dir = alert.direction === "above" ? "≥" : "≤";
  return `${alert.pair} ${dir} ${alert.targetRate}`;
}

export function AlertList({ alerts, onDelete, deletingId }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const pending = alerts.find((a) => a.id === pendingId) ?? null;

  return (
    <>
      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {conditionLabel(alert)}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Current:{" "}
                {alert.currentRate != null
                  ? alert.currentRate.toLocaleString(undefined, {
                      maximumFractionDigits: 8,
                    })
                  : "—"}
                {" · "}
                Created {formatDate(alert.createdAt)}
                {alert.triggered ? " · Triggered" : ""}
              </p>
              {alert.note && (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {alert.note}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPendingId(alert.id)}
              disabled={deletingId === alert.id}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
            >
              {deletingId === alert.id ? "Deleting…" : "Delete"}
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pending != null}
        title="Delete alert?"
        description={
          pending
            ? `Remove the alert for ${conditionLabel(pending)}? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete alert"
        tone="danger"
        busy={deletingId != null}
        onCancel={() => setPendingId(null)}
        onConfirm={() => {
          if (!pending) return;
          void onDelete(pending.id).finally(() => setPendingId(null));
        }}
      />
    </>
  );
}
