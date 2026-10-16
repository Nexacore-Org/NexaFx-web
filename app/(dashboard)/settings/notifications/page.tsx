import type { Metadata } from "next";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";
import NotificationPreferences from "../../../../components/settings/notification-preferences";

export const metadata: Metadata = { title: "Notifications · Settings" };

export default function SettingsNotificationsPage() {
  return (
    <SettingsSection
      title="Notifications"
      description="Choose which notifications you receive. Changes apply as soon as you toggle them."
    >
      <SettingsCard title="Notification preferences">
        <NotificationPreferences />
      </SettingsCard>
    </SettingsSection>
  );
}
