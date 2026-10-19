import type { ScheduleStatus } from "@/lib/api/schedules";

const STYLES: Record<ScheduleStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  paused:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  cancelled: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function ScheduleStatusPill({ status }: { status: ScheduleStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
