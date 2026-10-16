import { defineRouting } from "next-intl/routing";
import en from "../messages/en.json";
import yo from "../messages/yo.json";
import ha from "../messages/ha.json";
import ig from "../messages/ig.json";
import fr from "../messages/fr.json";

/**
 * Locales that actually have a message file, with their native names.
 *
 * The catalogue is imported statically rather than read from the filesystem
 * at runtime so it works on every deployment target, and so the set is
 * checked at build time: removing a `messages/xx.json` without removing its
 * entry here is a compile error rather than a selector entry that 404s.
 *
 * `englishName` is only for logs and debugging. The selector shows the
 * native name, spelled with correct diacritics — the previous selector in
 * the old app listed "Frances" and "Portuges", which is the bug this
 * replaces.
 */
const CATALOGUE = {
  en: { nativeName: "English", englishName: "English" },
  yo: { nativeName: "Yorùbá", englishName: "Yoruba" },
  ha: { nativeName: "Hausa", englishName: "Hausa" },
  ig: { nativeName: "Igbo", englishName: "Igbo" },
  fr: { nativeName: "Français", englishName: "French" },
} as const;

export type Locale = keyof typeof CATALOGUE;

export const messages = { en, yo, ha, ig, fr } as const;

export const defaultLocale: Locale = "en";

export const locales = Object.keys(CATALOGUE) as Locale[];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function nativeLocaleName(locale: Locale): string {
  return CATALOGUE[locale].nativeName;
}

export const LOCALE_COOKIE = "nexafx-locale";

/**
 * Attributes for the locale cookie. A year, so a returning visitor keeps
 * their choice. Readable by the client only so the selector can optimistically
 * reflect the choice; it holds no sensitive data.
 */
export function localeCookieOptions() {
  return {
    name: LOCALE_COOKIE,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax" as const,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  };
}

/**
 * Locale lives in a cookie rather than a URL segment, which was the explicit
 * decision for this change: the app has no localised URLs today, so a prefix
 * would mean either duplicating every route under `[locale]/` or adding a
 * proxy that rewrites paths. A cookie keeps every existing route and link
 * untouched and lets the server render a correct `<html lang>` on first
 * paint rather than correcting it after hydration.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "never",
});
