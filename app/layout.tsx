import type { Metadata } from "next";
import ReactQueryProvider from "@/lib/react-query-provider";
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
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
