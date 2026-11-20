/**
 * Single source of truth for the Settings navigation.
 *
 * Shared by the server layout and the client nav so the tab list cannot
 * drift between the two. Sections whose page is owned by a different
 * in-flight branch still render here; see each section page.
 */

export interface SettingsSection {
  /** Key under `settings.nav` in messages/*.json. */
  key: string;
  href: string;
  label: string;
  description: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    key: "profile",
    href: "/settings/profile",
    label: "Profile",
    description: "Your name and contact details.",
  },
  {
    key: "security",
    href: "/settings/security",
    label: "Security",
    description: "Password, two-factor authentication and active sessions.",
  },
  {
    key: "notifications",
    href: "/settings/notifications",
    label: "Notifications",
    description: "Choose which notifications you receive.",
  },
  {
    key: "preferences",
    href: "/settings/preferences",
    label: "Preferences",
    description: "Choose the language used across the site.",
  },
  {
    key: "account",
    href: "/settings/account",
    label: "Account",
    description: "Close your NexaFx account.",
  },
];

export const DEFAULT_SETTINGS_SECTION = "/settings/profile";

/**
 * Returns the nav entry matching `pathname`, so the active tab is derived
 * from the URL rather than from component state.
 */
export function activeSettingsSection(
  pathname: string,
): SettingsSection | undefined {
  return (
    SETTINGS_SECTIONS.find((section) => pathname.startsWith(section.href)) ??
    undefined
  );
}
