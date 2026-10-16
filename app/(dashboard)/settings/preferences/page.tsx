import type { Metadata } from "next";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";
import LanguageSelect from "../../../../components/settings/language-select";
import { resolveLocale } from "../../../../i18n/locale";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Preferences · Settings" };

export default async function SettingsPreferencesPage() {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "language" });

  return (
    <SettingsSection title={t("heading")} description={t("description")}>
      <SettingsCard title={t("heading")}>
        <LanguageSelect current={locale} />
      </SettingsCard>
    </SettingsSection>
  );
}
