"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getNotifications,
  type AppNotification,
} from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query-keys";
import { useReadNotifications } from "@/hooks/use-notification-store";

export function useNotifications() {
  const query = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    staleTime: 60_000,
  });

  const { readIds, isRead, markRead, markAllRead } = useReadNotifications();

  const notifications: AppNotification[] = query.data ?? [];

  const withReadState = useMemo(
    () => notifications.map((item) => ({ ...item, read: isRead(item.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notifications, readIds],
  );

  const unreadCount = useMemo(
    () => withReadState.filter((item) => !item.read).length,
    [withReadState],
  );

  return {
    ...query,
    notifications: withReadState,
    unreadCount,
    markRead,
    markAllRead,
    readIds,
  };
}
