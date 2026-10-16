import type { Metadata } from "next";
import Link from "next/link";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";

export const metadata: Metadata = { title: "Security · Settings" };

/**
 * Sign-in management lives in a sibling branch; this page is the index for
 * the Security section so the deeper routes are discoverable and linkable
 * even before those changes land.
 */
export default function SettingsSecurityPage() {
  return (
    <>
      <SettingsSection
        title="Security"
        description="Manage how you sign in and review where your account is currently signed in."
      />

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
