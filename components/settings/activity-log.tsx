"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  EVENT_FILTERS,
  describeEvent,
  fetchActivity,
  formatDay,
  groupByDay,
  isNotable,
  type ActivityEvent,
} from "../../lib/api/activity";
import { Skeleton } from "../ui/skeleton";

const TIME = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : TIME.format(date);
}

function EventRow({ event }: { event: ActivityEvent }) {
  const notable = isNotable(event);

  return (
    <li className="flex items-start gap-3 py-3">
      <span aria-hidden="true" className="mt-1 text-sm">
        {notable ? "!" : "·"}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {describeEvent(event)}
          {notable && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">
              Unusual activity
            </span>
          )}
        </p>

        {(event.device || event.ipAddress) && (
          <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
            {[event.device, event.ipAddress].filter(Boolean).join(" · ")}
          </p>
        )}

        {event.redacted && (
          <p className="mt-0.5 text-xs text-zinc-500 italic">
            Device and network details are hidden for this event.
          </p>
        )}
      </div>

      <time
        dateTime={event.occurredAt}
        className="shrink-0 text-xs text-zinc-500"
      >
        {formatTime(event.occurredAt)}
      </time>
    </li>
  );
}

/**
 * Chronological log of security-relevant account events, grouped by day and
 * filterable by event type, with incremental paging.
 */
export default function ActivityLog() {
  const [filter, setFilter] = useState<string>("all");

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["account-activity", filter],
    queryFn: ({ pageParam }) =>
      fetchActivity({ cursor: pageParam, type: filter }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
  });

  if (isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading account activity"
        className="space-y-3"
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height="2.5rem" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We could not load your account activity.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Retry
        </button>
      </div>
    );
  }

  const events = data?.pages.flatMap((page) => page.events) ?? [];
  const groups = groupByDay(events);

  return (
    <div>
      <div className="mb-4">
        <label
          className="mb-1 block text-sm font-medium"
          htmlFor="activity-filter"
        >
          Filter by event type
        </label>
        <select
          id="activity-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {EVENT_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No activity to show yet.
        </p>
      ) : (
        groups.map(([key, dayEvents]) => (
          <section key={key} className="mb-6">
            <h3 className="sticky top-0 bg-white py-1 text-sm font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              {formatDay(dayEvents[0].occurredAt)}
            </h3>
            <ul
              role="list"
              className="divide-y divide-zinc-200 dark:divide-zinc-800"
            >
              {dayEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </ul>
          </section>
        ))
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="rounded border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
