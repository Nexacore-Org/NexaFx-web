"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { setLocale } from "../../i18n/actions";
import { locales, nativeLocaleName, type Locale } from "../../i18n/routing";

/**
 * Language selector for Settings > Preferences.
 *
 * Lists exactly the locales that have a message file, in their own language
 * and correctly spelled, because the list is derived from the same catalogue
 * the server renders with rather than being hand-maintained.
 *
 * Changing the language writes a cookie and revalidates the layout; there is
 * no Save button because the selection applies immediately.
 */
export default function LanguageSelect({ current }: { current: Locale }) {
  const t = useTranslations("language");
  const [locale, setLocaleState] = useState<Locale>(current);
  const [pending, startTransition] = useTransition();

  const handleChange = (next: Locale) => {
    const previous = locale;
    setLocaleState(next);

    startTransition(async () => {
      try {
        await setLocale(next);
      } catch {
        // Roll the control back so it never claims a language the page is
        // not actually rendering in.
        setLocaleState(previous);
      }
    });
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor="site-language">
        {t("label")}
      </label>

      <select
        id="site-language"
        value={locale}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value as Locale)}
        aria-describedby="site-language-description"
        className="w-full max-w-xs rounded border border-zinc-300 bg-white px-3 py-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {nativeLocaleName(code)}
          </option>
        ))}
      </select>

      <p
        id="site-language-description"
        className="mt-2 max-w-prose text-sm text-zinc-600 dark:text-zinc-400"
      >
        {t("description")}
      </p>

      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 text-sm text-green-600"
      >
        {!pending && locale !== current ? t("saved") : ""}
      </p>
    </div>
  );
}
