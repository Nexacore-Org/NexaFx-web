"use client";

import { useMemo, useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { CategoryIcon } from "@/components/notifications/category-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/time";
import {
  categoryLabel,
  type NotificationCategory,
} from "@/lib/api/notifications";

type Filter = "all" | NotificationCategory;

const FILTERS: Filter[] = [
  "all",
  "transactions",
  "security",
  "promotions",
  "system",
];

export default function NotificationsPage() {
  const {
    notifications,
    isPending,
    isError,
    refetch,
    markRead,
    markAllRead,
    unreadCount,
  } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? notifications
        : notifications.filter((n) => n.category === filter),
    [notifications, filter],
  );

  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead(unreadIds)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Filter notifications by category"
        className="mb-4 flex flex-wrap gap-2"
      >
        {FILTERS.map((item) => {
          const active = filter === item;
          return (
            <button
              key={item}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                active
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item === "all" ? "All" : categoryLabel(item)}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <div className="space-y-3" role="status" aria-busy="true">
          <span className="sr-only">Loading notifications…</span>
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4"
            >
              <Skeleton width={36} height={36} />
              <div className="flex-1 space-y-2">
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={12} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"
        >
          <p>We couldn&apos;t load your notifications.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          variant={notifications.length === 0 ? "empty" : "no-results"}
          title={
            notifications.length === 0
              ? "No notifications yet"
              : "Nothing in this category"
          }
          description={
            notifications.length === 0
              ? "When something happens on your account, you’ll see it here."
              : "Try selecting a different category."
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => markRead(item.id)}
                className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left ${
                  item.read
                    ? "border-gray-200 bg-white"
                    : "border-blue-200 bg-blue-50/40"
                }`}
              >
                <CategoryIcon category={item.category} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </span>
                    {!item.read && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                        aria-label="Unread"
                      />
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-gray-600">
                    {item.body}
                  </span>
                  <span className="mt-1 block text-xs text-gray-400">
                    {categoryLabel(item.category)} ·{" "}
                    {relativeTime(item.createdAt)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
