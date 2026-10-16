import type { Metadata } from "next";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";
import DeleteAccount from "../../../../components/settings/delete-account";
import DataExport from "../../../../components/settings/data-export";

export const metadata: Metadata = { title: "Account · Settings" };

export default function SettingsAccountPage() {
  return (
    <>
      <SettingsSection
        title="Account"
        description="Close your NexaFx account."
      />

      <SettingsCard title="Data export">
        <DataExport />
      </SettingsCard>

      <SettingsCard tone="danger" title="Danger zone">
        <DeleteAccount />
      </SettingsCard>
    </>
  );
}
