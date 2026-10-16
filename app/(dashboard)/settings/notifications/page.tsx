import type { Metadata } from "next";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";

export const metadata: Metadata = { title: "Notifications · Settings" };

/**
 * This section is owned by a separate in-flight change (notification
 * preferences). Until it lands, the tab points here so the shell stays
 * navigable rather than 404ing.
 */
export default function SettingsNotificationsPage() {
  return (
    <SettingsSection
      title="Notifications"
      description="Choose which notifications you receive by email and in the app."
    >
      <SettingsCard title="Notification preferences">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This section is being built.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
