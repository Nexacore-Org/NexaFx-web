"use client";

import { cn } from "@/lib/utils";
import { Lock, Bell, User, ShieldCheck } from "lucide-react";

export function SettingsTabs() {
  const tabs = [
    { name: "Account Info", icon: User, active: false },
    { name: "Security", icon: Lock, active: false },
    { name: "Notification", icon: Bell, active: false },
    { name: "Identity Verification", icon: ShieldCheck, active: true },
  ];

  return (
    <div className="border-b border-border/50 mb-8">
      <nav
        className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={cn(
              "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
              tab.active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <tab.icon
              className={cn(
                "w-4 h-4",
                tab.active ? "text-primary" : "text-muted-foreground",
              )}
            />
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
