import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./routing";

/**
 * Resolve the active locale from the `nexafx-locale` cookie.
 *
 * An unknown, empty or missing cookie falls back to the default locale, so a
 * stale or hand-edited cookie can never break rendering.
 */
export async function resolveLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("nexafx-locale")?.value;
  return isLocale(value) ? value : defaultLocale;
}
