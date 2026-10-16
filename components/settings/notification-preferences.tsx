"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  fetchNotificationPreferences,
  saveNotificationPreference,
  type NotificationPreferenceCategory,
  type NotificationChannel,
  type NotificationPreferences,
} from "../../lib/api/notifications";
import { notify } from "../../lib/notify";
import { Skeleton } from "../ui/skeleton";

const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  email: "Email",
  inApp: "In-app",
};

/**
 * Per-category, per-channel notification preferences.
 *
 * Each toggle saves on its own with an optimistic update, so there is no
 * Save button and a single failing toggle does not lose the others. A failed
 * save restores the previous value and surfaces an error.
 */
export default function NotificationPreferences() {
  const queryClient = useQueryClient();
  const queryKey = ["notification-preferences"] as const;
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<number | null>(null);

  const preferences = useQuery({
    queryKey,
    queryFn: fetchNotificationPreferences,
  });

  useEffect(() => {
    return () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
    };
  }, []);

  const toggle = useMutation({
    mutationFn: ({
      category,
      channel,
      enabled,
    }: {
      category: NotificationPreferenceCategory;
      channel: NotificationChannel;
      enabled: boolean;
    }) => saveNotificationPreference(category, channel, enabled),

    onMutate: async ({ category, channel, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<NotificationPreferences>(queryKey);

      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(queryKey, {
          ...previous,
          [category]: { ...previous[category], [channel]: enabled },
        });
      }

      return { previous };
    },

    onSuccess: () => {
      setJustSaved(true);
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setJustSaved(false), 2500);
    },

    onError: (err: Error, _vars, context) => {
      // Put the toggle back the way the user found it.
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      notify.error(err.message || "That preference could not be saved.");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  if (preferences.isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading notification preferences"
        className="space-y-4"
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height="4rem" />
        ))}
      </div>
    );
  }

  if (preferences.isError) {
    return (
      <div role="alert">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We could not load your notification preferences.
        </p>
        <button
          type="button"
          onClick={() => preferences.refetch()}
          className="mt-3 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Retry
        </button>
      </div>
    );
  }

  const values = preferences.data;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-md border-collapse text-sm">
          <caption className="sr-only">
            Notification preferences by category and channel
          </caption>
          <thead>
            <tr>
              <th scope="col" className="pb-2 text-left font-medium">
                Category
              </th>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <th
                  key={channel}
                  scope="col"
                  className="w-28 pb-2 text-center font-medium"
                >
                  {CHANNEL_LABEL[channel]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_CATEGORIES.map((category) => (
              <tr
                key={category.id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <th
                  scope="row"
                  className="py-3 pr-4 text-left align-top font-normal"
                >
                  <span className="font-medium">{category.label}</span>
                  <span className="mt-1 block text-zinc-600 dark:text-zinc-400">
                    {category.description}
                  </span>
                  {category.lockedReason && (
                    <span className="mt-1 block text-xs text-zinc-500 italic">
                      {category.lockedReason}
                    </span>
                  )}
                </th>

                {NOTIFICATION_CHANNELS.map((channel) => {
                  const checked = values?.[category.id][channel] ?? false;
                  const id = `${category.id}-${channel}`;

                  return (
                    <td key={channel} className="py-3 text-center align-top">
                      <span className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          role="switch"
                          id={id}
                          checked={checked}
                          disabled={category.locked || toggle.isPending}
                          onChange={(event) =>
                            toggle.mutate({
                              category: category.id,
                              channel,
                              enabled: event.target.checked,
                            })
                          }
                          aria-describedby={
                            category.locked ? `${id}-locked` : undefined
                          }
                          className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        {category.locked && (
                          <span id={`${id}-locked`} className="sr-only">
                            Always on
                          </span>
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-sm text-green-600"
      >
        {justSaved ? "Saved" : ""}
      </p>
    </div>
  );
}
