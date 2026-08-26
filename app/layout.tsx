import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToastViewport } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PwaInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeProvider } from "@/components/theme-provider";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { SessionTimeoutWarning } from "@/components/shared/session-timeout-warning";
import { GlobalSearch } from "@/components/shared/global-search";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexaFx — Multi-Currency Finance on Stellar",
    template: "%s | NexaFx",
  },
  description:
    "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
  keywords: [
    "currency exchange",
    "Stellar blockchain",
    "cross-border payments",
    "NGN to USD",
    "crypto finance",
  ],
  authors: [{ name: "Nexacore" }],
  creator: "Nexacore",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NexaFx",
  },
  icons: {
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexafx.io",
    siteName: "NexaFx",
    title: "NexaFx — Multi-Currency Finance on Stellar",
    description:
      "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "NexaFx" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexaFx — Multi-Currency Finance on Stellar",
    description:
      "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F39A00",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <LanguageSwitcher />
              {children}
              <GlobalSearch />
              <PwaInstallPrompt />
              <OfflineBanner />
              <SessionTimeoutWarning />
              <Toaster />
              <ToastViewport />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
