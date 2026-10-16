export type NavIconKey =
  "dashboard" | "convert" | "transactions" | "notifications" | "settings";

export interface NavItem {
  key: NavIconKey;
  href: string;
  label: string;
  title: string;
}

/**
 * Single source of truth for the dashboard sidebar, the mobile bottom bar and
 * the topbar title. Every `href` must resolve to a real route; this is enforced
 * by `scripts/check-nav-routes.mjs`.
 */
export const navItems: NavItem[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    title: "Dashboard",
  },
  { key: "convert", href: "/convert", label: "Convert", title: "Convert" },
  {
    key: "transactions",
    href: "/transactions",
    label: "Transactions",
    title: "Transactions",
  },
  {
    key: "notifications",
    href: "/notifications",
    label: "Notifications",
    title: "Notifications",
  },
  { key: "settings", href: "/settings", label: "Settings", title: "Settings" },
];

/**
 * Returns true when `href` is the active route for `pathname`. Nested routes
 * stay active (e.g. `/transactions/123` keeps Transactions selected).
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

/**
 * Derives the topbar title from the current path, matching nested routes too.
 * Falls back to the app name when nothing matches.
 */
export function deriveTitle(pathname: string): string {
  const match = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActivePath(pathname, item.href));
  return match?.title ?? "NexaFx";
}
