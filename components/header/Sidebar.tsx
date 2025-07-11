// components/Sidebar.tsx
"use client";

import {
  Home,
  Wallet,
  Bell,
  User,
  ArrowDownUp,
  X,
  ChevronLeft,
} from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const initialMenuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: ArrowDownUp, label: "Convert", href: "/dashboard/convert" },
  { icon: Wallet, label: "Transactions", href: "/dashboard/transactions" },
  { icon: Bell, label: "Settings", href: "/dashboard/settings" },
  // { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobile, toggleCollapse } =
    useSidebarStore();

  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const router = useRouter();

  const handleMenuClick = (href: string, label: string) => {
    setMenuItems((prev) =>
      prev.map((item) => ({
        ...item,
        active: item.label === label,
      }))
    );
    router.push(href);
  };
  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const target = event.target as Node;

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
        <div className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 
        ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64 bg-bg-sidebar`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={closeMobile}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full px-3 pb-4 overflow-y-auto">
          {/* Logo and Toggle Section */}
          <div className="mb-6 pt-6">
            <div
              className={`flex items-center justify-between p-2.5 ${
                isCollapsed ? "lg:w-16" : "lg:w-60"
              } rounded-full bg-white shadow-sm`}
            >
              <div className="flex items-center gap-2">
                {!isCollapsed && (
                  <div className="">
                    <Image src="/logo.png" alt="Logo" width={124} height={42} />
                  </div>
                )}
              </div>
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-2 rounded-full hover:bg-gray-100"
              >
                {isCollapsed ? (
                  <div className="">
                    <Image
                      src="/logo-mini.svg"
                      alt="Logo"
                      width={20}
                      height={20}
                    />
                  </div>
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <ul className="space-y-3 font-medium">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleMenuClick(item.href, item.label)}
                    className={`flex items-center text-text-tertiary rounded-full hover:bg-brand-primary group ${
                      item.active ? "bg-brand-primary" : "bg-white"
                    } transition-all duration-300 ${
                      isCollapsed
                        ? "lg:w-12 lg:h-12 lg:justify-center"
                        : "w-full h-12 pl-4"
                    } mb-2`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <IconComponent
                      className={`w-5 h-5 text-text-tertiary transition duration-75 group-hover:text-gray-900 ${
                        item.active ? "text-text-tertiary" : ""
                      }`}
                    />
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </button>
                </li>
              );
            })}

            {/* Logout button */}
            {/* <li className="pt-4 mt-4 border-t border-gray-200">
              <a
                href="/logout"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-red-50 hover:text-red-600 group"
                title={isCollapsed ? "Logout" : ""}>
                <LogOut className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-red-600" />
                {!isCollapsed && <span className="ml-3">Logout</span>}
              </a>
            </li> */}
          </ul>
        </div>
      </aside>
    </>
  );
}
