import type { Metadata } from "next";
import Link from "next/link";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";
import ChangePasswordForm from "../../../../components/settings/change-password-form";
import TwoFactorSettings from "../../../../components/settings/two-factor";
import ActiveSessions from "../../../../components/settings/active-sessions";

export const metadata: Metadata = { title: "Security · Settings" };

export default function SettingsSecurityPage() {
  return (
    <>
      <SettingsSection
        title="Security"
        description="Manage how you sign in and review where your account is currently signed in."
      />

      <SettingsCard
        title="Change password"
        description="Choose a password you do not use on any other site. Changing it may sign you out on your other devices."
      >
        <ChangePasswordForm />
      </SettingsCard>

      <SettingsCard
        title="Two-factor authentication"
        description="Require a one-time code from an authenticator app in addition to your password."
      >
        <TwoFactorSettings />
      </SettingsCard>

      <SettingsCard
        title="Active sessions"
        description="Devices currently signed in to your account. If you do not recognise one, sign it out and change your password."
      >
        <ActiveSessions />
      </SettingsCard>

      <SettingsCard
        title="Account activity"
        description="A log of sign-ins, password changes and other security events on your account."
      >
        <Link
          href="/settings/security/activity"
          className="text-sm font-medium underline"
        >
          View account activity
        </Link>
      </SettingsCard>
    </>
  );
}
