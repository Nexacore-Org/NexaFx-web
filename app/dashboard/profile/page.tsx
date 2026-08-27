"use client";

import { SettingsTabs } from "@/components/profile/settings-tabs";

export default function ProfilePage() {
  return (
    <div className="max-w-350 mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="w-full font-bold bg-card inline-block px-4 py-2 rounded-lg shadow-sm border border-border/50">
        <h1 className="text-2xl ">Settings</h1>
      </div>

      {/* Tabs */}
      <SettingsTabs />
    </div>
  );
}
