"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Mails,
  LogOut,
  Home,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ isCollapsed, onToggleCollapse, isMobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      name: "Analytics",
      href: "/admin",
      icon: Home,
      isActive: pathname === "/admin",
    },
    {
      name: "Transaction",
      href: "/admin/transactions",
      icon: ArrowLeftRight,
      isActive: pathname === "/admin/transactions",
    },
    {
      name: "Push Notification",
      href: "/admin/notifications",
      icon: Mails,
      isActive: pathname === "/admin/notifications",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-in-out ${
          isMobileOpen
            ? "bg-black/50"
            : "bg-opacity-0 pointer-events-none"
        }`}
        onClick={onMobileClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isCollapsed ? "md:w-16" : "md:w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header with Logo/Collapse Button */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-center rounded-full bg-white p-2 py-1">
            {isCollapsed ? (
           // Show only collapse button when collapsed
           <button
             onClick={onToggleCollapse}
             className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
             aria-label="Expand sidebar"
           >
             <ChevronRight className="w-5 h-5 text-gray-600" />
           </button>
         ) : (
           // Show logo and collapse button when expanded
           <>
             <div className="flex items-center flex-1">
               <Image
                 src="/logo.png"
                 alt="NexaFX"
                 width={150}
                 height={150}
                 className="transition-all duration-300"
               />
             </div>
             <button
               onClick={onToggleCollapse}
               className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
               aria-label="Collapse sidebar"
             >
               <ChevronLeft className="w-5 h-5 text-gray-600" />
             </button>
           </>
         )}
       </div>
       </div>

      {/* Navigation Items */}
      <nav className={`flex-1 py-6 space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-full text-sm font-medium transition-colors group ${
                isCollapsed 
                  ? "p-3 justify-center" 
                  : "p-3"
              } ${item.isActive
                  ? "bg-brand-primary text-black"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 ${isCollapsed ? "w-4 h-4" : "mr-3"} ${item.isActive ? "text-black" : "text-gray-600 group-hover:text-gray-900"
                  }`}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className={`border-t border-gray-200 ${isCollapsed ? "p-2" : "p-4"}`}>
        <button
          className={`flex items-center w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors group ${
            isCollapsed ? "p-3 justify-center" : "px-3 py-2"
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut
            className={`${isCollapsed ? "w-6 h-6" : "w-5 h-5"} ${isCollapsed ? "mr-0" : "mr-3"} text-gray-600 group-hover:text-gray-900`}
          />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
      </div>
    </>
  );
}
