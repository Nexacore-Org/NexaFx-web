"use client";

import {
  Home,
  Wallet,
  ArrowDownUp,
  ChevronLeft,
  Copy,
  Settings,
} from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: ArrowDownUp, label: "Convert", href: "/dashboard/convert" },
  { icon: Wallet, label: "Transaction", href: "/dashboard/transactions" },
  { icon: Settings, label: "Setting", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isMobileOpen, closeMobile, toggleCollapse } =
    useSidebarStore();

  const handleMenuClick = (href: string) => {
    router.push(href);
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const target = event.target as Node;

      const menuButton = (event.target as HTMLElement).closest("button");
      if (
        isMobileOpen &&
        menuButton &&
        sidebar &&
        sidebar.contains(menuButton)
      ) {
        closeMobile();
        return;
      }

      if (isMobileOpen && sidebar && !sidebar.contains(target)) {
        closeMobile();
      }
    };

    if (isMobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen, closeMobile]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-white opacity-40 backdrop-blur-2xl lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed left-0 top-0 z-50 h-screen transition-all duration-300 
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 
        ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-80 bg-bg-sidebar`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          {/* Logo and Toggle Section */}
          <div className="mb-6 pt-6">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between px-2.5">
              <Image src="/logo.png" alt="Logo" width={124} height={42} />
              <button
                onClick={closeMobile}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Desktop Header */}
            <div
              className={`hidden lg:flex items-center justify-between p-2.5 ${
                isCollapsed ? "lg:w-16" : "lg:w-60"
              } rounded-full bg-white shadow-sm`}
            >
              <div className="flex items-center gap-2">
                {!isCollapsed && (
                  <Image src="/logo.png" alt="Logo" width={124} height={42} />
                )}
              </div>
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-2 rounded-full hover:bg-gray-100"
              >
                {isCollapsed ? (
                  <Image
                    src="/logo-mini.svg"
                    alt="Logo"
                    width={20}
                    height={20}
                  />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* User Profile Section - Mobile */}
          <div className="lg:hidden p-4 rounded-lg bg-[linear-gradient(240deg,rgba(160,195,253,0.40)_-1.74%,rgba(255,231,156,0.40)_99.3%)] mb-4">
            <div className="flex items-center gap-4">
              <Image
                src="/user.png"
                alt="User"
                width={56}
                height={54}
                className="rounded-xl"
              />
              <div>
                <h3 className="text-black font-semibold text-[20.086px] leading-[140%] tracking-[0.603px]">
                  cerseiload
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[#595959] block text-xs font-medium leading-[140%] tracking-[0.12px]">
                    Wallet address:
                  </span>
                  <span className="text-black block text-[12.342px] font-semibold leading-[140%] tracking-[0.123px]">
                    0xAbc...123
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText("0xAbc...123")}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <ul className="space-y-3 font-medium">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard" // Only exact match for dashboard
                  : pathname.startsWith(item.href); // Prefix match for others

              return (
                <li key={index}>
                  <button
                    onClick={() => handleMenuClick(item.href)}
                    className={`flex items-center text-text-tertiary rounded-full group ${
                      isActive
                        ? "bg-brand-primary text-black"
                        : "bg-transparent hover:bg-brand-primary/20"
                    } transition-all duration-300 ${
                      isCollapsed
                        ? "lg:w-12 lg:h-12 lg:justify-center"
                        : "w-full h-12 pl-4"
                    } mb-2`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <IconComponent
                      className={`w-5 h-5 text-text-tertiary transition duration-75 group-hover:text-black ${
                        isActive ? "text-black" : ""
                      }`}
                    />
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
