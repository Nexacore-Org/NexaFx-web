"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../lib/notify";
import {
  SESSIONS_SUPPORTED,
  fetchSessions,
  revokeOtherSessions,
  revokeSession,
  type UserSession,
} from "../../lib/api/sessions";
import { Skeleton } from "../ui/skeleton";
import ConfirmDialog from "../ui/confirm-dialog";

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const ABSOLUTE = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function formatRelative(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "unknown";

  const deltaSeconds = Math.round((then - now) / 1000);
  const abs = Math.abs(deltaSeconds);

  if (abs < 45) return "just now";

  for (const [unit, seconds] of UNITS) {
    if (abs >= seconds) {
      return RELATIVE.format(Math.round(deltaSeconds / seconds), unit);
    }
  }

  return RELATIVE.format(Math.round(deltaSeconds / 60), "minute");
}

function formatAbsolute(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Unknown time" : ABSOLUTE.format(date);
}

function describe(session: UserSession): string {
  return (
    [session.device, session.browser].filter(Boolean).join(" on ") ||
    "Unknown device"
  );
}

/**
 * Active sessions list for Settings > Security.
 *
 * The current session is labelled and cannot be revoked from here; use the
 * account Logout action instead, which also clears the session cookie.
 * Revokes are optimistic, and a failure restores the removed row.
 */
export default function ActiveSessions() {
  const queryClient = useQueryClient();
  const queryKey = ["sessions"] as const;
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  const sessions = useQuery({
    queryKey,
    queryFn: fetchSessions,
    enabled: SESSIONS_SUPPORTED,
  });

  const revoke = useMutation({
    mutationFn: revokeSession,
    onMutate: async (sessionId: string) => {
      setPendingRevoke(sessionId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<UserSession[]>(queryKey);

      queryClient.setQueryData<UserSession[]>(queryKey, (old) =>
        old?.filter((s) => s.id !== sessionId),
      );

      // Returned so onError can put the row back exactly where it was.
      return { previous };
    },
    onError: (err: Error, _sessionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      notify.error(err.message || "We could not sign that session out.");
    },
    onSettled: () => {
      setPendingRevoke(null);
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const revokeAll = useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: () => {
      setConfirmAllOpen(false);
      notify.success("Signed out of all other sessions.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: Error) => {
      notify.error(err.message || "We could not sign out other sessions.");
    },
  });

  if (!SESSIONS_SUPPORTED) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Session management is not available on this deployment yet.
      </p>
    );
  }

  if (sessions.isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading active sessions"
        className="space-y-3"
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height="3.5rem" />
        ))}
      </div>
    );
  }

  if (sessions.isError) {
    return (
      <div role="alert">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We could not load your active sessions.
        </p>
        <button
          type="button"
          onClick={() => sessions.refetch()}
          className="mt-3 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Retry
        </button>
      </div>
    );
  }

  const list = sessions.data ?? [];
  const otherCount = list.filter((s) => !s.current).length;

  if (list.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No active sessions found.
      </p>
    );
  }

  return (
    <div>
      <ul role="list" className="space-y-3">
        {list.map((session) => (
          <li
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {describe(session)}
                {session.current && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-normal text-green-800 dark:bg-green-900 dark:text-green-200">
                    This device
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {session.location ?? "Location unavailable"}
                {" · "}
                <time
                  dateTime={session.lastActiveAt}
                  title={formatAbsolute(session.lastActiveAt)}
                >
                  Active {formatRelative(session.lastActiveAt)}
                </time>
              </p>
            </div>

            {session.current ? (
              <p className="text-xs text-zinc-500">
                Use Logout to end this session
              </p>
            ) : (
              <button
                type="button"
                onClick={() => revoke.mutate(session.id)}
                disabled={revoke.isPending}
                className="shrink-0 rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                {pendingRevoke === session.id ? "Signing out…" : "Sign out"}
              </button>
            )}
          </li>
        ))}
      </ul>

      {otherCount > 0 && (
        <button
          type="button"
          onClick={() => setConfirmAllOpen(true)}
          className="mt-4 rounded border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
        >
          Sign out all other sessions ({otherCount})
        </button>
      )}

      <ConfirmDialog
        open={confirmAllOpen}
        title="Sign out all other sessions"
        tone="danger"
        confirmLabel="Sign out all others"
        busy={revokeAll.isPending}
        onCancel={() => setConfirmAllOpen(false)}
        onConfirm={() => revokeAll.mutate()}
        description={`This will end ${otherCount} other ${otherCount === 1 ? "session" : "sessions"} on your other devices. You will stay signed in here.`}
      />
    </div>
  );
}
