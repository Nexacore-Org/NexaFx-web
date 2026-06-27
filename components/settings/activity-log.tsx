"use client";

import { useState } from "react";
import {
  LogIn,
  Lock,
  User,
  Shield,
  ShieldOff,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ActivityEntry {
  id: string;
  type:
    | "login"
    | "password_change"
    | "profile_update"
    | "2fa_enable"
    | "2fa_disable"
    | "device_login";
  description: string;
  timestamp: string;
  device: string;
  browser: string;
  location: string;
}

const MOCK_ACTIVITIES: ActivityEntry[] = [
  {
    id: "1",
    type: "login",
    description: "Logged in to your account",
    timestamp: "2025-06-27T10:30:00Z",
    device: "iPhone 15 Pro",
    browser: "Safari 18",
    location: "Lagos, Nigeria",
  },
  {
    id: "2",
    type: "password_change",
    description: "Password changed successfully",
    timestamp: "2025-06-25T14:22:00Z",
    device: "MacBook Pro M4",
    browser: "Chrome 125",
    location: "Lagos, Nigeria",
  },
  {
    id: "3",
    type: "profile_update",
    description: "Profile information updated",
    timestamp: "2025-06-20T09:15:00Z",
    device: "MacBook Pro M4",
    browser: "Chrome 125",
    location: "Lagos, Nigeria",
  },
  {
    id: "4",
    type: "2fa_enable",
    description: "Two-factor authentication enabled",
    timestamp: "2025-06-18T16:45:00Z",
    device: "Samsung Galaxy S25",
    browser: "Samsung Internet",
    location: "Abuja, Nigeria",
  },
  {
    id: "5",
    type: "login",
    description: "Logged in to your account",
    timestamp: "2025-06-17T08:00:00Z",
    device: "Samsung Galaxy S25",
    browser: "Chrome 124",
    location: "Abuja, Nigeria",
  },
  {
    id: "6",
    type: "2fa_disable",
    description: "Two-factor authentication disabled",
    timestamp: "2025-06-15T11:30:00Z",
    device: "Windows PC",
    browser: "Firefox 127",
    location: "Port Harcourt, Nigeria",
  },
  {
    id: "7",
    type: "device_login",
    description: "New device logged in",
    timestamp: "2025-06-10T19:20:00Z",
    device: "iPad Air",
    browser: "Safari 17",
    location: "Ibadan, Nigeria",
  },
  {
    id: "8",
    type: "password_change",
    description: "Password changed successfully",
    timestamp: "2025-06-05T07:55:00Z",
    device: "MacBook Pro M4",
    browser: "Chrome 123",
    location: "Lagos, Nigeria",
  },
  {
    id: "9",
    type: "login",
    description: "Logged in to your account",
    timestamp: "2025-06-01T22:10:00Z",
    device: "iPhone 15 Pro",
    browser: "Safari 18",
    location: "Lagos, Nigeria",
  },
  {
    id: "10",
    type: "profile_update",
    description: "Profile picture updated",
    timestamp: "2025-05-28T13:40:00Z",
    device: "MacBook Pro M4",
    browser: "Chrome 123",
    location: "Lagos, Nigeria",
  },
];

const ITEMS_PER_PAGE = 5;

function getActivityIcon(type: ActivityEntry["type"]) {
  switch (type) {
    case "login":
      return LogIn;
    case "password_change":
      return Lock;
    case "profile_update":
      return User;
    case "2fa_enable":
      return Shield;
    case "2fa_disable":
      return ShieldOff;
    case "device_login":
      return Smartphone;
  }
}

function getActivityColor(type: ActivityEntry["type"]) {
  switch (type) {
    case "login":
      return "text-blue-500 bg-blue-500/10";
    case "password_change":
      return "text-orange-500 bg-orange-500/10";
    case "profile_update":
      return "text-purple-500 bg-purple-500/10";
    case "2fa_enable":
      return "text-green-500 bg-green-500/10";
    case "2fa_disable":
      return "text-red-500 bg-red-500/10";
    case "device_login":
      return "text-cyan-500 bg-cyan-500/10";
  }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
            <div className="h-3 w-56 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityLog() {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = Math.ceil(MOCK_ACTIVITIES.length / ITEMS_PER_PAGE);
  const paginated = MOCK_ACTIVITIES.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="rounded-2xl border-[#8C8C8C] border-[0.25px] bg-card">
      <h3 className="text-muted-foreground mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
        Activity Log
      </h3>

      {isLoading ? (
        <div className="p-5">
          <ActivitySkeleton />
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-5">
          <Monitor className="size-12 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">
            No recent activity
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your account activity will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {paginated.map((entry) => {
            const Icon = getActivityIcon(entry.type);
            return (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getActivityColor(entry.type)}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {entry.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTimestamp(entry.timestamp)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {entry.device}
                    </span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      {entry.browser}
                    </span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      {entry.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
