"use client";

import { useEffect } from "react";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { SwipeableNotificationItem } from "@/components/notifications";
import { mockNotifications } from "@/lib/mock-notifications";

export default function NotificationsPage() {
  const { notifications, setNotifications, markAsRead, removeNotification } =
    useNotificationsStore();

  useEffect(() => {
    if (notifications.length === 0) {
      setNotifications(mockNotifications);
    }
  }, [notifications.length, setNotifications]);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleDelete = (id: string) => {
    removeNotification(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {notifications.length === 0 ? (
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
