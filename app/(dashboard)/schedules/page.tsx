"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ConfirmDialog from "@/components/ui/confirm-dialog";
import ScheduleForm from "@/components/schedules/schedule-form";
import ScheduleList from "@/components/schedules/schedule-list";
import {
  cancelSchedule,
  getSchedules,
  pauseSchedule,
  resumeSchedule,
  SCHEDULES_ENABLED,
  type Schedule,
} from "@/lib/api/schedules";
import { queryKeys } from "@/lib/query-keys";
import { notify } from "@/lib/notify";

export default function SchedulesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [pendingCancel, setPendingCancel] = useState<Schedule | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.schedules,
    queryFn: getSchedules,
    enabled: SCHEDULES_ENABLED,
  });

  const schedules = data ?? [];

  const markBusy = (id: string) => {
    setBusyIds((prev) => new Set(prev).add(id));
  };

  const unmarkBusy = (id: string) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const replace = (updated: Schedule) => {
    queryClient.setQueryData<Schedule[]>(queryKeys.schedules, (prev) =>
      (prev ?? []).map((s) => (s.id === updated.id ? updated : s)),
    );
  };

  const pause = useMutation({
    mutationFn: pauseSchedule,
    onMutate: (id) => markBusy(id),
    onSettled: (_data, _err, id) => unmarkBusy(id),
    onSuccess: (updated) => {
      replace(updated);
      notify.success("Schedule paused.");
    },
    onError: (err: any) => {
      notify.error(err?.message || "Failed to pause schedule. Please try again.");
    },
  });

  const resume = useMutation({
    mutationFn: resumeSchedule,
    onMutate: (id) => markBusy(id),
    onSettled: (_data, _err, id) => unmarkBusy(id),
    onSuccess: (updated) => {
      replace(updated);
      notify.success("Schedule resumed.");
    },
    onError: (err: any) => {
      notify.error(err?.message || "Failed to resume schedule. Please try again.");
    },
  });

  const cancel = useMutation({
    mutationFn: cancelSchedule,
    onMutate: (id) => {
      setCancelError(null);
      markBusy(id);
    },
    onSettled: (_data, _err, id) => unmarkBusy(id),
    onSuccess: (_void, id) => {
      queryClient.setQueryData<Schedule[]>(queryKeys.schedules, (prev) =>
        (prev ?? []).map((s) =>
          s.id === id ? { ...s, status: "cancelled", nextRunAt: null } : s,
        ),
      );
      setPendingCancel(null);
      setCancelError(null);
      notify.success("Schedule cancelled.");
    },
    onError: (err: any) => {
      const message = err?.message || "Failed to cancel schedule. Please try again.";
      setCancelError(message);
      notify.error(message);
    },
  });

  if (!SCHEDULES_ENABLED) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Schedules
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Automate one-off and recurring conversions.
          </p>
        </header>
        <p className="rounded-lg border border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Scheduled and recurring conversions are not yet available. Check back
          soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Schedules
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Automate one-off and recurring conversions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New schedule
        </button>
      </header>

      {isPending ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600">
            Unable to load your schedules. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium text-blue-700 underline dark:text-blue-400"
          >
            Retry
          </button>
        </div>
      ) : schedules.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No schedules yet. Create one to automate a recurring conversion.
        </p>
      ) : (
        <ScheduleList
          schedules={schedules}
          onPause={(id) => pause.mutate(id)}
          onResume={(id) => resume.mutate(id)}
          onRequestCancel={(schedule) => {
            setCancelError(null);
            setPendingCancel(schedule);
          }}
          busyIds={busyIds}
          busyId={busyIds.size > 0 ? Array.from(busyIds)[0] : null}
        />
      )}

      <ScheduleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={(created) =>
          queryClient.setQueryData<Schedule[]>(queryKeys.schedules, (prev) => [
            created,
            ...(prev ?? []),
          ])
        }
      />

      <ConfirmDialog
        open={pendingCancel !== null}
        tone="danger"
        busy={cancel.isPending}
        title="Cancel this schedule?"
        description="This schedule will stop running and cannot be resumed. This cannot be undone."
        confirmLabel="Cancel schedule"
        cancelLabel="Keep it"
        onConfirm={() => {
          if (pendingCancel) cancel.mutate(pendingCancel.id);
        }}
        onCancel={() => {
          setPendingCancel(null);
          setCancelError(null);
        }}
      >
        {cancelError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
            {cancelError}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
