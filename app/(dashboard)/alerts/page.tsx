"use client";

import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateAlertDialog } from "@/components/alerts/create-alert-dialog";
import { AlertList } from "@/components/alerts/alert-list";
import {
  type CreateAlertInput,
  type RateAlert,
  createAlert,
  deleteAlert,
  listAlerts,
} from "@/lib/api/alerts";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [maxAlerts, setMaxAlerts] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAlerts();
      setAlerts(res.alerts);
      setMaxAlerts(res.maxAlerts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load rate alerts.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const atLimit = alerts.length >= maxAlerts;

  async function handleCreate(input: CreateAlertInput) {
    setCreating(true);
    try {
      const created = await createAlert(input);
      setAlerts((prev) => [created, ...prev]);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete alert.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Rate alerts
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Get notified when a pair crosses your target rate.
            {maxAlerts > 0
              ? ` ${alerts.length}/${maxAlerts} used.`
              : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={atLimit}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create alert
        </button>
      </header>

      {atLimit && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          You have reached the maximum of {maxAlerts} alerts. Delete one to
          create another.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div
          className="space-y-3"
          role="status"
          aria-busy="true"
          aria-label="Loading alerts"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          variant="empty"
          title="No rate alerts yet"
          description="Create an alert to be notified when a currency pair crosses your target rate."
          action={{
            label: "Create alert",
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <AlertList
          alerts={alerts}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <CreateAlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
        busy={creating}
        atLimit={atLimit}
      />
    </div>
  );
}
