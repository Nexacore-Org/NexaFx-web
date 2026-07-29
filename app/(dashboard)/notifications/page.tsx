"use client";

import { useEffect } from "react";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { SwipeableNotificationItem } from "@/components/notifications";

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/4 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    removeNotification,
  } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleDelete = (id: string) => {
    removeNotification(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <SwipeableNotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification.id)}
                onDelete={() => handleDelete(notification.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
