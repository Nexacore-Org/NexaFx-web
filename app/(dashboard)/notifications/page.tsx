"use client";

import { useCallback, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { SwipeableNotificationItem } from "@/components/notifications";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationListSkeleton } from "@/components/shared/page-skeletons";

function NotificationSkeleton() {
  return <NotificationListSkeleton rows={5} />;
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

  const handleNotificationClick = useCallback((id: string) => {
    markAsRead(id);
  }, [markAsRead]);

  const handleDelete = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

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
          <EmptyState
            icon={<Bell className="h-16 w-16" />}
            title="You're all caught up"
            description="You'll see notifications here when there's activity on your account."
          />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <SwipeableNotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
