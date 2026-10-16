import type { Metadata } from "next";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";

export const metadata: Metadata = { title: "Preferences · Settings" };

/**
 * This section is owned by a separate in-flight change (language and display
 * preferences). Until it lands, the tab points here so the shell stays
 * navigable rather than 404ing.
 */
export default function SettingsPreferencesPage() {
  return (
    <SettingsSection
      title="Preferences"
      description="Language, currency and display options."
    >
      <SettingsCard title="Display preferences">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This section is being built.
        </p>
      </SettingsCard>
    </SettingsSection>
  );
}
