// components/Navbar.tsx
"use client";

import { Menu, BellDot, ChevronLeft } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import Image from "next/image";
// import clsx from "clsx";
// import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

// const navItems = ["Dashboard", "Convert"];

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/convert": "Convert",
  "/dashboard/transactions": "Transactions",
  "/dashboard/settings": "Settings",
  "/dashboard/notifications": "Notifications",
};

export default function Navbar() {
  const pathname = usePathname();

  const currentPageName = pageNames[pathname] || "Dashboard";
  const { toggleMobile, isCollapsed, isMobileOpen } = useSidebarStore();

  return (
    <nav
      className={`flex fixed z-40 top-0 px-4 py-6 justify-between items-center self-stretch backdrop-blur-2xl transition-all duration-300 left-0 right-0 
        bg-[linear-gradient(240deg,rgba(160,195,253,0.40)_-1.74%,rgba(255,231,156,0.40)_99.3%)] 
        md:bg-white md:bg-none
        ${isCollapsed ? "lg:left-20" : "lg:left-68"}`}
    >
      {/* Left section */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobile}
          className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          {isMobileOpen ? (
            <ChevronLeft className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Page name */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-8 px-3 text-xl lg:text-2xl">
            {currentPageName}
          </Button>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Notification/Settings Icon */}
        <div className="md:w-9 md:h-9 w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center">
          <BellDot className="w-5 h-5 text-black" />
        </div>

        {/* Avatar */}
        <div className="md:w-9 md:h-9 w-7 h-7 rounded-full overflow-hidden">
          <Image src="/user.png" alt="Avatar" width={36} height={36} />
        </div>
      </div>
    </nav>
  );
}
