<<<<<<< HEAD
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
=======
// import type React from "react";
// import { Inter } from "next/font/google";

// const inter = Inter({ subsets: ["latin"] });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return <main className={inter.className}>{children}</main>;
// }

// components/Layout.tsx
'use client';

import { ReactNode } from 'react';
import { useSidebarStore } from '@/store/sidebarStore';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="bg-bg-sidebar min-h-screen ">
      <Sidebar />

      {/* Main content */}
      <div
        className={`transition-all duration-300  md:pr-4 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-68"
        }`}
      >
        <Navbar />
        <div className="pt-20 min-h-[calc(100vh-80px)]">{children}</div>
      </div>
    </div>
  );
}
>>>>>>> 3042a2a (feat: worked on dashboard sidebar and navbar)
