import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Manrope } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexafx.io"),
  title: {
    default: "NexaFx \u2014 Multi-Currency Finance on Stellar",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexafx.io",
    siteName: "NexaFx",
    title: "NexaFx \u2014 Multi-Currency Finance on Stellar",
    description:
      "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
    images: [
      { url: "/og-image.png", width: 1200, height: 630, alt: "NexaFx" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexaFx \u2014 Multi-Currency Finance on Stellar",
    description:
      "Convert, deposit, and transfer currencies instantly on the Stellar blockchain.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${manrope.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
