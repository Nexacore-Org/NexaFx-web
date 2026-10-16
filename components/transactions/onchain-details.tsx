"use client";

import { useEffect, useState } from "react";
import {
  fetchHorizonTransaction,
  stroopsToXlm,
  type HorizonResult,
} from "@/lib/api/horizon";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton({ width, height }: { width: string; height: string }) {
  return (
    <div
      className="animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// OnchainDetails
// ---------------------------------------------------------------------------

interface OnchainDetailsProps {
  hash: string;
}

/**
 * Collapsible "On-chain details" section that fetches Stellar Horizon data.
 *
 * - Shows a skeleton while loading.
 * - Shows a soft "Not confirmed on-chain yet" for 404 responses.
 * - On Horizon errors, renders a non-fatal inline message so the rest of
 *   the transaction detail page keeps working.
 * - Confirmed results are cached in component state (sufficient for one
 *   detail page view; do not re-fetch when already loaded).
 */
export function OnchainDetails({ hash }: OnchainDetailsProps) {
  const [open, setOpen] = useState(true);
  const [result, setResult] = useState<HorizonResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = await fetchHorizonTransaction(hash);
      if (!cancelled) {
        setResult(res);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hash]);

  const formattedDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        });
  };

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
      aria-label="On-chain details"
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={open}
        aria-controls="onchain-panel"
      >
        <div className="flex items-center gap-2">
          {/* Stellar logo-like icon */}
          <svg
            className="h-5 w-5 text-blue-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            On-chain details
          </span>
          {result?.status === "ok" && result.data.successful && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Confirmed
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          id="onchain-panel"
          className="border-t border-zinc-100 px-6 pb-5 dark:border-zinc-800"
        >
          {loading && (
            <div
              className="space-y-3 pt-4"
              aria-label="Loading on-chain details"
            >
              <Skeleton width="60%" height="14px" />
              <Skeleton width="45%" height="14px" />
              <Skeleton width="55%" height="14px" />
              <Skeleton width="40%" height="14px" />
            </div>
          )}

          {!loading && result?.status === "not_found" && (
            <p className="pt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Not confirmed on-chain yet. The transaction may still be
              processing or the hash has not yet been submitted to the Stellar
              network.
            </p>
          )}

          {!loading && result?.status === "error" && (
            <p className="pt-4 text-sm text-amber-700 dark:text-amber-400">
              Could not load on-chain details right now.{" "}
              <span className="text-zinc-500 dark:text-zinc-400">
                ({result.message})
              </span>
            </p>
          )}

          {!loading && result?.status === "ok" && (
            <dl className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
              <div className="flex justify-between py-3">
                <dt className="text-zinc-500 dark:text-zinc-400">Ledger</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  #{result.data.ledger.toLocaleString()}
                </dd>
              </div>

              <div className="flex justify-between py-3">
                <dt className="text-zinc-500 dark:text-zinc-400">
                  Confirmed at
                </dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  <time dateTime={result.data.createdAt}>
                    {formattedDate(result.data.createdAt)}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between py-3">
                <dt className="text-zinc-500 dark:text-zinc-400">
                  Fee charged
                </dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {stroopsToXlm(result.data.feeCharged)} XLM
                  <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-500">
                    ({result.data.feeCharged.toLocaleString()} stroops)
                  </span>
                </dd>
              </div>

              <div className="flex justify-between py-3">
                <dt className="text-zinc-500 dark:text-zinc-400">Operations</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {result.data.operationCount}
                </dd>
              </div>

              <div className="flex justify-between py-3">
                <dt className="text-zinc-500 dark:text-zinc-400">
                  Network result
                </dt>
                <dd>
                  {result.data.successful ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Success
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      Failed
                    </span>
                  )}
                </dd>
              </div>

              <div className="flex justify-between py-3">
                <dt className="text-zinc-500 dark:text-zinc-400">Explorer</dt>
                <dd>
                  <a
                    href={result.data.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                    aria-label="View transaction on Stellar Expert (opens in new tab)"
                  >
                    Stellar Expert
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </dd>
              </div>
            </dl>
          )}
        </div>
      )}
    </section>
  );
}
