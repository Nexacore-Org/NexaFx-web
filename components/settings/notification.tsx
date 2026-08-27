"use client";

import { useCallback, useEffect, useState } from "react";
import { Switch } from "../ui/switch";

type Channel = "inApp" | "email" | "sms";

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  channels: Record<Channel, boolean>;
  lockedInApp?: boolean;
  lockedNote?: string;
}

const STORAGE_KEY = "notification-prefs";

const defaultPreferences: NotificationCategory[] = [
  {
    id: "transaction",
    title: "Transaction Confirmations",
    description:
      "Receive notifications when deposits, withdrawals, and conversions are completed",
    channels: { inApp: true, email: true, sms: false },
  },
  {
    id: "security",
    title: "Security Alerts",
    description:
      "Get notified about suspicious login attempts, password changes, and security updates",
    channels: { inApp: true, email: true, sms: true },
    lockedInApp: true,
    lockedNote:
      "In-app security alerts cannot be disabled for your protection",
  },
  {
    id: "rate",
    title: "Rate Alerts",
    description:
      "Notifications when exchange rates reach your target thresholds",
    channels: { inApp: true, email: false, sms: false },
  },
  {
    id: "marketing",
    title: "Marketing & Product Updates",
    description:
      "Learn about new features, promotions, and platform updates",
    channels: { inApp: false, email: true, sms: false },
  },
];

const channelLabels: Record<Channel, string> = {
  inApp: "In-app",
  email: "Email",
  sms: "SMS",
};

function loadPreferences(): NotificationCategory[] {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPreferences;
    const parsed = JSON.parse(stored);
    return defaultPreferences.map((def) => {
      const saved = parsed.find((p: NotificationCategory) => p.id === def.id);
      return {
        ...def,
        channels: saved ? { ...def.channels, ...saved.channels } : def.channels,
      };
    });
  } catch {
    return defaultPreferences;
  }
}

export function Notification() {
  const [preferences, setPreferences] =
    useState<NotificationCategory[]>(defaultPreferences);
  const [savedPreferences, setSavedPreferences] =
    useState<NotificationCategory[]>(defaultPreferences);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    setSavedPreferences(loaded);
  }, []);

  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const toggleChannel = useCallback(
    (categoryId: string, channel: Channel) => {
      setPreferences((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          if (cat.lockedInApp && channel === "inApp") return cat;
          return {
            ...cat,
            channels: {
              ...cat.channels,
              [channel]: !cat.channels[channel],
            },
          };
        })
      );
    },
    []
  );

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setSavedPreferences(preferences);
    setToast("Notification preferences saved successfully");
    setTimeout(() => setToast(null), 3000);
  }, [preferences]);

  const handleCancel = useCallback(() => {
    setPreferences(savedPreferences);
  }, [savedPreferences]);

  return (
    <div>
      {toast && (
        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {toast}
        </div>
      )}

      <div className="rounded-2xl border-[0.25px] border-[#8C8C8C] bg-card">
        <h3 className="mx-5 border-b border-[#00000026] pb-4.5 pt-6.25 mb-4.5 font-semibold text-base text-muted-foreground dark:border-slate-300 dark:text-white">
          Notification Preferences
        </h3>

        <div className="space-y-0 divide-y divide-[#00000010] dark:divide-slate-700/50">
          {preferences.map((category) => (
            <div key={category.id} className="px-5 py-6">
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-foreground font-semibold text-[15px] sm:text-lg">
                    {category.title}
                  </h4>
                  {category.lockedInApp && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Required for account security
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12px] font-normal text-muted-foreground">
                  {category.description}
                </p>
              </div>

              <div className="space-y-3 ml-1">
                {(Object.keys(channelLabels) as Channel[]).map((channel) => {
                  const isLocked =
                    category.lockedInApp && channel === "inApp";

                  return (
                    <div
                      key={channel}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="max-w-100">
                        <p className="text-foreground text-sm font-medium">
                          {channelLabels[channel]}
                        </p>
                        {isLocked && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground italic">
                            {category.lockedNote}
                          </p>
                        )}
                      </div>
                      <Switch
                        className="gradient-blue-yellow border-none"
                        size="lg"
                        checked={category.channels[channel]}
                        disabled={isLocked}
                        onCheckedChange={() =>
                          toggleChannel(category.id, channel)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ml-auto mt-10 mb-3.5 flex max-w-105.25 flex-col gap-3 md:flex-row">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1 cursor-pointer rounded-sm bg-[#F0BB16] py-4 text-sm font-medium text-black transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          disabled={!hasChanges}
          className="flex-1 cursor-pointer rounded-sm border border-border py-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
