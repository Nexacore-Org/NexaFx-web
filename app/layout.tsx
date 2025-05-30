import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexaFX",
  description: "Seamless Currency Exchange From Naira to USDT and More",
  icons: {
    icon: "/nexaShortIcon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
