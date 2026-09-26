import type { Metadata } from "next";
import dynamic from "next/dynamic";
import DashboardLayoutClient from "./dashboard-layout-client";

const SupportChat = dynamic(
  () => import("@/components/shared/support-chat").then((m) => m.SupportChat),
  { ssr: false },
);

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
      <SupportChat />
    </>
  );
}
