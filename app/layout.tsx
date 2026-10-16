import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/app/(client)/toaster";
import { resolveLocale } from "@/i18n/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The locale is read from a cookie in the root layout so `<html lang>` and
 * the message catalogue are correct on the first paint rather than after
 * hydration. That makes every route depend on request data, so under
 * `cacheComponents` these segments are allowed to block instead of being
 * prerendered. Everything below the layout still streams normally.
 */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The locale lives in a cookie, so the server knows it on the first paint.
  const locale = await resolveLocale();

  // The locale is passed explicitly rather than inferred from a `[locale]`
  // segment: this app has no locale-prefixed routes. `getMessages()` and
  // `getTranslations()` both accept an explicit locale override for exactly
  // this setup.
  const messages = await getMessages({ locale });

  return (
    // `lang` reflects the active locale, so screen readers, browser
    // hyphenation and font fallback behave correctly from the first byte.
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
