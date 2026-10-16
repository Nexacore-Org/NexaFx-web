import type { ReactNode } from "react";
import { SETTINGS_SECTIONS } from "../../../components/settings/settings-nav";
import SettingsNav from "../../../components/settings/settings-nav-client";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col gap-6 p-6 md:flex-row md:gap-10">
      <nav aria-label="Settings" className="md:w-56 md:shrink-0">
        <h1 className="mb-3 text-xl font-semibold">Settings</h1>
        <SettingsNav sections={SETTINGS_SECTIONS} />
      </nav>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
