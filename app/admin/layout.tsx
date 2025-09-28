"use client";

import React, { ReactNode, useState } from "react";
import { AdminSidebar } from "@/components/header/AdminSidebar";
import { AdminHeader } from "@/components/header/AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Auth protection temporarily disabled for design review
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-col">
        <AdminHeader 
          isCollapsed={isSidebarCollapsed}
          isMobileMenuOpen={isMobileSidebarOpen}
          onMobileMenuToggle={toggleMobileSidebar}
        />
        <main
          className={`transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
          } pl-0`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}