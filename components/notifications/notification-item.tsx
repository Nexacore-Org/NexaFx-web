"use client";

import { Download, AlertCircle, Calendar } from "lucide-react";
import { KycIcon, SwapIcon } from "@/components/icons";
import { Notification, NotificationType } from "@/types/notification";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "kyc":
      return <KycIcon className="w-5 h-5" />;
    case "deposit":
      return <Download className="w-5 h-5" />;
    case "swap":
      return <SwapIcon className="w-5 h-5" />;
    case "system":
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
}

function getIconBackgroundColor(type: NotificationType) {
  switch (type) {
    case "kyc":
      return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    case "deposit":
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "swap":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
    case "system":
    default:
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

function highlightBoldText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={index} className="font-semibold">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const { type, title, message, timestamp, isRead } = notification;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-5 min-h-16 flex items-start gap-3 transition-colors hover:bg-muted/50",
        !isRead && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          getIconBackgroundColor(type)
        )}
      >
        {getNotificationIcon(type)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">
          {highlightBoldText(message)}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formatRelativeTime(timestamp)}</span>
        </div>
      </div>

      {!isRead && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  );
}
