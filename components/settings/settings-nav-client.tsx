"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SettingsSection } from "./settings-nav";

/**
 * Settings tab strip. Navigation is real links so each section is
 * directly linkable, reload-safe and back/forward friendly, and the active
 * tab is derived from the URL rather than held in state.
 *
 * The strip scrolls horizontally on narrow screens instead of wrapping into a
 * tall block that pushes the section content below the fold.
 */
export default function SettingsNav({
  sections,
}: {
  sections: SettingsSection[];
}) {
  const pathname = usePathname();

  return (
    <ul
      className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible"
      role="list"
    >
      {sections.map((section) => {
        const active =
          pathname === section.href || pathname.startsWith(`${section.href}/`);

        return (
          <li key={section.href} className="shrink-0 md:shrink">
            <Link
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded px-3 py-2 text-sm whitespace-nowrap ${
                active
                  ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {section.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
