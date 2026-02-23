"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface MenuItem {
  icon: string | React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const adminMenuItems: MenuItem[] = [
  { icon: "/icons/analytics.svg", label: "Analytics", href: "/admin/analytics" },
  { icon: ArrowUpDown, label: "Transaction", href: "/admin/transactions" },
  { icon: "/icons/push-notification.svg", label: "Push Notification", href: "/admin/push-notifications" },
  { icon: "/icons/users-list.svg", label: "User list", href: "/admin/users" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Image
              src="/icons/logo.svg"
              alt="NexaFX"
              width={100}
              height={32}
              priority
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const isIconString = typeof item.icon === 'string';
          const IconComponent = !isIconString ? item.icon as React.ComponentType<{ className?: string }> : null;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 rounded-xl transition-all",
                isCollapsed ? "justify-center px-0" : "px-4",
                isActive
                  ? "bg-[#FFD552] text-black font-semibold shadow-sm"
                  : "text-gray-600 hover:bg-gray-50",
              )}
              title={isCollapsed ? item.label : ""}
            >
              {isIconString ? (
                <Image
                  src={item.icon as string}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={cn(
                    "shrink-0",
                    isActive ? "brightness-0" : "opacity-60",
                  )}
                />
              ) : IconComponent ? (
                <IconComponent
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-black" : "text-gray-400",
                  )}
                />
              ) : null}
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
