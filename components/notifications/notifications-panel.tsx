"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { NotificationItem } from "./notification-item";
import { Checkbox } from "@/components/ui/checkbox";

export function NotificationsPanel() {
  const { notifications, isOpen, close, markAsRead, markAllAsRead, unreadCount } =
    useNotificationsStore();

  if (!isOpen) return null;

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={close}
      />

      {/* Panel */}
      <div className="absolute top-full right-0 mt-2 w-[400px] bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Notifications</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <Checkbox
                checked={unreadCount === 0 && notifications.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) handleMarkAllAsRead();
                }}
                disabled={unreadCount === 0}
              />
              <span>Mark all as read</span>
            </label>
            <Link
              href="/settings"
              onClick={close}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
