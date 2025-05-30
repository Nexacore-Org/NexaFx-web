// components/Sidebar.tsx
"use client";

import { Home, Wallet, Bell, User, ArrowDownUp, X } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const initialMenuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: ArrowDownUp, label: "Convert", href: "/dashboard/convert" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebarStore();

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
        className={`fixed top-0 left-0 z-40 h-screen pt-28 transition-transform lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}>
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-3 right-3">
          <button
            onClick={closeMobile}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-3 font-medium">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleMenuClick(item.href, item.label)}
                    className={`flex items-center text-[#5E5E5E] rounded-full hover:bg-[#FFD552] group ${
                      item.active ? "bg-[#FFD552]" : "bg-white"
                    } ${
                      isCollapsed
                        ? "p-4 justify-center"
                        : "p-4 w-full text-left"
                    }`}
                    title={isCollapsed ? item.label : ""}>
                    <IconComponent
                      className={`w-5 h-5 text-[#5E5E5E] transition duration-75 group-hover:text-gray-900 ${
                        item.active ? "text-[#5E5E5E]" : ""
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
