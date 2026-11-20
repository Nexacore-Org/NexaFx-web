import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SETTINGS_SECTIONS } from "../../../components/settings/settings-nav";
import SettingsNav from "../../../components/settings/settings-nav-client";

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("settings");
  const sections = SETTINGS_SECTIONS.map((s) => ({
    ...s,
    label: t(`nav.${s.key}.label`),
    description: t(`nav.${s.key}.description`),
  }));

  return (
    <div className="flex min-h-full flex-col gap-6 p-6 md:flex-row md:gap-10">
      <nav aria-label="Settings" className="md:w-56 md:shrink-0">
        <h1 className="mb-3 text-xl font-semibold">{t("title")}</h1>
        <SettingsNav sections={sections} />
      </nav>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
