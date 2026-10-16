"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, localeCookieOptions, type Locale } from "@/i18n/routing";

/**
 * Persists the chosen locale in a cookie and re-renders the tree.
 *
 * The locale is validated against the catalogue, so a hand-crafted form post
 * cannot persist a locale with no message file.
 */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  const store = await cookies();
  const options = localeCookieOptions();
  store.set(options.name, locale satisfies Locale, options);

  // The root layout reads the cookie, so every route needs to be re-rendered
  // with the new value.
  revalidatePath("/", "layout");
}
