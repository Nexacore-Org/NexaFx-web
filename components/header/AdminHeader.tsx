"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BellDot, Menu, X } from "lucide-react";
import Image from "next/image";

interface AdminHeaderProps {
  isCollapsed: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export function AdminHeader({ isCollapsed, isMobileMenuOpen = false, onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();

  // Get page title based on current route
  const getPageTitle = (): string => {
    switch (pathname) {
      case "/admin":
        return "Analytics";
      case "/admin/transactions":
        return "Transactions";
      case "/admin/notifications":
        return "Push Notifications";
      default:
        return "Admin Dashboard";
    }
  };

  const pageTitle = getPageTitle();

  return (
    <div
      className={`bg-white border-b border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? "md:ml-16" : "md:ml-64"
      } ml-0`}
    >
      <div className="py-3 md:py-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button + Page Title */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Toggle - Only visible on mobile */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {/* Page Title */}
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">{pageTitle}</h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              className="p-1.5 rounded-full border border-gray-200 transition-colors"
              aria-label="Settings"
            >
              <BellDot className="w-6 h-6 text-text-crypto-symbol hover:text-text-secondary transition-colors" />
            </button>
            
            {/* User Avatar */}
            <Image
              src="/user.png"
              alt="User Avatar"
              width={32}
              height={32}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
