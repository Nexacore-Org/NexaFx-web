"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Mail,
  CircleUserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import Image from "next/image";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  // { icon: ArrowUpDown, label: "Convert", href: "/convert" },
  { icon: Mail, label: "Transactions", href: "/transactions" },
  { icon: CircleUserRound, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const close = useSidebarStore((state) => state.close);

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="logo p-4">
        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-full px-4 py-2 bg-white dark:bg-muted/20 border border-border transition-all",
            isCollapsed ? "px-2 justify-center" : "px-4",
          )}
        >
          {!isCollapsed && (
            <Image
              src="/icons/logo.svg"
              alt="Logo"
              className="h-8"
              width={100}
              height={100}
              priority
            />
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hover:bg-muted rounded-full p-1 transition-colors"
            >
              {!isCollapsed ? (
                <ChevronLeft className="size-5 text-black dark:text-white" />
              ) : (
                <ChevronRight className="size-5 text-black dark:text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2.5 px-4 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={cn(
              "flex items-center gap-3 rounded-full py-3 text-sm font-medium transition-all",
              isCollapsed ? "justify-center px-0" : "px-4",
              pathname === item.href
                ? "bg-primary text-black"
                : "bg-white dark:bg-muted/10 text-black dark:text-white hover:bg-sidebar-accent",
            )}
            title={isCollapsed ? item.label : ""}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
