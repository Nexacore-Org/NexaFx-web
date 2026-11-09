"use client";

import { ScheduleStatusPill } from "./schedule-status-pill";
import { frequencyLabel } from "@/lib/api/schedules";
import type { Schedule } from "@/lib/api/schedules";

interface ScheduleListProps {
  schedules: Schedule[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRequestCancel: (schedule: Schedule) => void;
  busyId?: string | null;
  busyIds?: Set<string> | string[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ScheduleList({
  schedules,
  onPause,
  onResume,
  onRequestCancel,
  busyId,
  busyIds,
}: ScheduleListProps) {
  const isRowBusy = (id: string): boolean => {
    if (busyIds instanceof Set) return busyIds.has(id);
    if (Array.isArray(busyIds)) return busyIds.includes(id);
    return busyId === id;
  };

  return (
    <ul className="space-y-3">
      {schedules.map((schedule) => {
        const busy = isRowBusy(schedule.id);
        const isCancelled = schedule.status === "cancelled";
        const isPaused = schedule.status === "paused";
        return (
          <li
            key={schedule.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {schedule.amount} {schedule.fromCurrency} →{" "}
                  {schedule.toCurrency}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {frequencyLabel(schedule.frequency)} · starts{" "}
                  {schedule.startDate}
                  {schedule.endDate ? ` · ends ${schedule.endDate}` : ""}
                </p>
              </div>
              <ScheduleStatusPill status={schedule.status} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Next run</dt>
                <dd className="mt-0.5 font-medium">
                  {formatDate(schedule.nextRunAt)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Last run</dt>
                <dd className="mt-0.5 font-medium">
                  {formatDate(schedule.lastRunAt)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 dark:text-zinc-400">Total runs</dt>
                <dd className="mt-0.5 font-medium">{schedule.totalRuns}</dd>
              </div>
            </dl>

            {!isCancelled && (
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                {isPaused ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onResume(schedule.id)}
                    className="rounded border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {busy ? "Resuming…" : "Resume"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onPause(schedule.id)}
                    className="rounded border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {busy ? "Pausing…" : "Pause"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRequestCancel(schedule)}
                  className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
