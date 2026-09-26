"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  admin: "Admin",
  analytics: "Analytics",
  transactions: "Transactions",
  flagged: "Flagged",
  "push-notifications": "Push Notifications",
  users: "Users",
  reports: "Reports",
  disputes: "Disputes",
  kyc: "KYC",
  "kyc-review": "KYC Review",
  fees: "Fees",
  config: "Config",
  security: "Security",
  health: "Health",
  "system-health": "System Health",
  "ip-allowlist": "IP Allowlist",
  communications: "Communications",
  announcements: "Announcements",
  broadcast: "Broadcast",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] !== "admin") {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => ({
    href: "/" + segments.slice(0, index + 1).join("/"),
    label: routeLabels[segment] || segment,
    isLast: index === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-sm bg-gray-50 px-4 py-2.5 rounded-lg">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          )}

          {crumb.isLast ? (
            <span className="flex items-center gap-1.5 font-semibold text-gray-900 whitespace-nowrap">
              {index === 0 && <Home className="h-4 w-4 shrink-0" />}
              <span className="hidden sm:inline">{crumb.label}</span>
              <span className="sm:hidden text-xs">
                {crumb.label.length > 6 ? crumb.label.slice(0, 4) : crumb.label}
              </span>
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              {index === 0 && <Home className="h-4 w-4 shrink-0" />}
              <span className="hidden sm:inline">{crumb.label}</span>
              <span className="sm:hidden text-xs">
                {crumb.label.length > 6 ? crumb.label.slice(0, 4) : crumb.label}
              </span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
