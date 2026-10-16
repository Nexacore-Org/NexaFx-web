"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Dialog } from "@/components/ui/dialog";
import { FormError } from "./settings-section";
import {
  type DataExportRequest,
  type ExportStatus,
  requestDataExport,
  getDataExportStatus,
} from "@/lib/api/user";

function statusLabel(status: ExportStatus): string {
  switch (status) {
    case "requested":
      return "Requested";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready";
    case "expired":
      return "Expired";
    default:
      return status;
  }
}

/**
 * Self-service "download my data" request.
 *
 * The user re-enters their password to confirm the request; the password is
 * never persisted. While the backend prepares the archive, the status is
 * polled until it is ready to download or has expired.
 */
export default function DataExport() {
  const [open, setOpen] = useState(false);
  const [exportInfo, setExportInfo] = useState<DataExportRequest | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setPassword("");
    setError(null);
  };

  useEffect(() => {
    let mounted = true;
    async function fetchLatest() {
      try {
        const latest = await getDataExportStatus();
        if (mounted) {
          setExportInfo(latest);
        }
      } catch {
        if (mounted) {
          setError("Failed to load export status");
        }
      }
    }
    fetchLatest();
    return () => {
      mounted = false;
    };
  }, []);

  const pollingRequestId =
    exportInfo?.status === "preparing" ? exportInfo.requestId : null;

  // Poll while an export is being prepared. State is only updated from the
  // async callback, never synchronously inside the effect body.
  useEffect(() => {
    if (!pollingRequestId) return;
    const id = setInterval(async () => {
      try {
        const updated = await getDataExportStatus(pollingRequestId);
        if (updated) {
          setExportInfo(updated);
        }
      } catch {
        // Ignore transient polling errors; the next tick retries.
      }
    }, 5000);
    return () => clearInterval(id);
  }, [pollingRequestId]);

  const isPending =
    exportInfo?.status === "requested" || exportInfo?.status === "preparing";
  const isPolling = exportInfo?.status === "preparing";
  const canDownload =
    exportInfo?.status === "ready" && Boolean(exportInfo.downloadUrl);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await requestDataExport(password);
      setExportInfo(res);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request export");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
          Request an export of your account data. We&apos;ll notify you when
          it&apos;s ready to download.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={isPending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Request export
        </button>
      </div>

      <Dialog
        open={open}
        onClose={close}
        title="Request data export"
        description="Re-enter your password to confirm this request."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="data-export-password"
            >
              Password
            </label>
            <input
              id="data-export-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <FormError message={error} />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              disabled={loading}
              className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || password.length === 0}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {loading ? "Requesting..." : "Request export"}
            </button>
          </div>
        </form>
      </Dialog>

      {exportInfo && (
        <div className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              <span className="font-medium">Export status:</span>{" "}
              {statusLabel(exportInfo.status)}
            </p>
            {isPolling && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Checking...
              </p>
            )}
          </div>
          {canDownload && exportInfo.downloadUrl && (
            <a
              href={exportInfo.downloadUrl}
              download
              className="inline-flex items-center justify-center rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Download
            </a>
          )}
          {exportInfo.status === "expired" && (
            <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/40">
              Your export has expired. You can request a new export.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
