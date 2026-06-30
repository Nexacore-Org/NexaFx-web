"use client";

import { Bell } from "lucide-react";
import { useNotificationsStore } from "@/hooks/use-notifications-store";

export function NotificationBell() {
  const { unreadCount, toggle } = useNotificationsStore();

  return (
    <button
      onClick={toggle}
      className="relative p-2 hover:bg-muted rounded-full transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
      aria-label={`Toggle notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"
          aria-label={`${unreadCount} unread notifications`}
        />
      )}
    </button>
  );
}
