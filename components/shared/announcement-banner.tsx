"use client";

import { useEffect, useState } from "react";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAnnouncements, type Announcement, type AnnouncementType } from "@/lib/api/admin";

const bannerStyles: Record<AnnouncementType, { bg: string; text: string; border: string; icon: typeof Info }> = {
  info: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", icon: Info },
  warning: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", icon: AlertTriangle },
  success: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200", icon: CheckCircle },
  error: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200", icon: AlertCircle },
};

const STORAGE_KEY = "dismissed_announcements";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dismissAnnouncement(id: string) {
  try {
    const dismissed = getDismissed();
    dismissed.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
  } catch {
    // localStorage may be full
  }
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(getDismissed());
    getAnnouncements()
      .then((data) => {
        const now = new Date();
        const active = data.filter(
          (a) =>
            a.isActive &&
            new Date(a.startAt) <= now &&
            new Date(a.endAt) >= now,
        );
        setAnnouncements(active);
      })
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.includes(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-4 md:px-8">
      {visible.map((a) => {
        const style = bannerStyles[a.type];
        const Icon = style.icon;
        return (
          <div
            key={a.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm",
              style.bg,
              style.border,
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.text)} />
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold", style.text)}>{a.title}</p>
              <p className={cn("text-sm mt-0.5", style.text)}>{a.message}</p>
            </div>
            <button
              onClick={() => {
                dismissAnnouncement(a.id);
                setDismissed((prev) => [...prev, a.id]);
              }}
              className={cn(
                "p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0",
                style.text,
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
