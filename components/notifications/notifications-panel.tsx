"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { NotificationItem } from "./notification-item";
import { Checkbox } from "@/components/ui/checkbox";

function PanelSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4 animate-pulse">
          <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsPanel() {
  const {
    notifications,
    isOpen,
    isLoading,
    close,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    unreadCount,
    pendingDeletes,
    pendingClearAll,
    clearAllNotifications,
    undoClearAll,
  } = useNotificationsStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

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
      <div className="fixed inset-0 z-40" onClick={close} />

      {/* Panel */}
      <div className="absolute top-full right-0 mt-2 w-100 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Notifications
          </h3>
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
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={notifications.length === 0 || !!pendingClearAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
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
        <div className="max-h-100 overflow-y-auto">
          {isLoading ? (
            <PanelSkeleton />
          ) : showClearConfirm ? (
            <div className="p-6 text-center">
              <p className="text-sm text-foreground mb-4">
                Clear all notifications?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearAllNotifications();
                    setShowClearConfirm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : pendingClearAll ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                All notifications cleared.
              </p>
              <button
                onClick={undoClearAll}
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: "#F39A00" }}
              >
                Undo
              </button>
            </div>
          ) : notifications.length === 0 && pendingDeletes.size === 0 ? (
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
              {Array.from(pendingDeletes.entries()).map(
                ([id, { notification }]) => (
                  <NotificationItem
                    key={`pending-${id}`}
                    notification={notification}
                    isPendingDelete
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
