import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/i18n/locale";

export default async function Home() {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{t("appName")}</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        {t("tagline")}
      </p>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-500">
        {t("rebuild")}
      </p>
    </main>
  );
}
