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
"use client";

import { ReactNode } from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import Navbar from "@/components/header/Navbar";
import Sidebar from "@/components/header/Sidebar";

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
