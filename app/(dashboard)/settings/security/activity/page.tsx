import type { Metadata } from "next";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../../components/settings/settings-section";
import ActivityLog from "../../../../../components/settings/activity-log";

export const metadata: Metadata = { title: "Account activity · Settings" };

export default function AccountActivityPage() {
  return (
    <>
      <SettingsSection
        title="Account activity"
        description="Security-relevant events on your account, newest first. If you do not recognise something here, sign out unknown sessions and change your password."
      >
        <SettingsCard title="Activity log">
          <ActivityLog />
        </SettingsCard>
      </SettingsSection>
    </>
  );
}
