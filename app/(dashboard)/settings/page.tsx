"use client";

import { TabsSettings } from "@/components/settings/tabs";

export default function SettingsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account profile and security preferences.
        </p>
      </header>
      <TabsSettings />
    </div>
  );
}
