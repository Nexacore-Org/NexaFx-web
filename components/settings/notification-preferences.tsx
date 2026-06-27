'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface NotificationSubToggle {
  key: string;
  label: string;
}

interface NotificationSection {
  key: string;
  title: string;
  description: string;
  subToggles: NotificationSubToggle[];
}

const SECTIONS: NotificationSection[] = [
  {
    key: 'email',
    title: 'Email Notifications',
    description: 'Receive notifications via email',
    subToggles: [
      { key: 'email_transaction', label: 'Transaction confirmations' },
      { key: 'email_deposit', label: 'Deposit received' },
      { key: 'email_withdrawal', label: 'Withdrawal processed' },
      { key: 'email_kyc', label: 'KYC status updates' },
      { key: 'email_security', label: 'Account security alerts' },
      { key: 'email_promotional', label: 'Promotional offers' },
    ],
  },
  {
    key: 'push',
    title: 'Push Notifications',
    description: 'Receive push notifications on your device',
    subToggles: [
      { key: 'push_transaction', label: 'Transaction confirmations' },
      { key: 'push_deposit', label: 'Deposit received' },
      { key: 'push_withdrawal', label: 'Withdrawal processed' },
      { key: 'push_kyc', label: 'KYC status updates' },
      { key: 'push_security', label: 'Account security alerts' },
      { key: 'push_promotional', label: 'Promotional offers' },
    ],
  },
  {
    key: 'in_app',
    title: 'In-App Notifications',
    description: 'Receive notifications within the app',
    subToggles: [
      { key: 'in_app_transaction', label: 'Transaction confirmations' },
      { key: 'in_app_deposit', label: 'Deposit received' },
      { key: 'in_app_withdrawal', label: 'Withdrawal processed' },
      { key: 'in_app_kyc', label: 'KYC status updates' },
      { key: 'in_app_security', label: 'Account security alerts' },
      { key: 'in_app_promotional', label: 'Promotional offers' },
    ],
  },
];

export function NotificationPreferences() {
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of SECTIONS) {
      initial[section.key] = true;
      for (const sub of section.subToggles) {
        initial[sub.key] = true;
      }
    }
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (section: NotificationSection) => {
    const newValue = !settings[section.key];
    setSettings((prev) => {
      const next = { ...prev, [section.key]: newValue };
      for (const sub of section.subToggles) {
        next[sub.key] = newValue;
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call — replace with actual save logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => (
        <div
          key={section.key}
          className="rounded-2xl border-[#8C8C8C] border-[0.25px] bg-card"
        >
          <div className="flex items-center justify-between mx-5 pt-6.25 pb-4.5 border-b border-[#00000026]">
            <div>
              <h3 className="text-muted-foreground font-semibold text-base">
                {section.title}
              </h3>
              <p className="text-[12px] text-muted-foreground font-normal mt-0.5">
                {section.description}
              </p>
            </div>
            <Switch
              checked={settings[section.key]}
              onCheckedChange={() => toggleSection(section)}
              className="gradient-blue-yellow border-none"
              size="lg"
            />
          </div>

          <div className="space-y-4 py-5">
            {section.subToggles.map((sub) => (
              <div
                key={sub.key}
                className="flex items-center justify-between px-5"
              >
                <span className="text-foreground text-sm font-medium">
                  {sub.label}
                </span>
                <Switch
                  checked={settings[sub.key]}
                  onCheckedChange={() => toggleSetting(sub.key)}
                  className="gradient-blue-yellow border-none"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 md:flex-row flex-col md:max-w-105.25 mt-10 mb-3.5 ml-auto">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 cursor-pointer py-4 bg-[#F0BB16] hover:bg-yellow-500 rounded-sm text-black font-medium transition-colors md:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button className="flex-1 cursor-pointer py-4 border border-border hover:bg-muted text-foreground font-semibold rounded-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
