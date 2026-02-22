"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, User, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { NotificationsPanel } from "@/components/notifications";

export function Topbar() {
  const pathname = usePathname();
  const openSidebar = useSidebarStore((state) => state.open);

  // Initialize state with a function that checks DOM on mount
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const {
    unreadCount,
    fetchUnreadCount,
    toggle: toggleNotifications,
  } = useNotificationsStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Format title from pathname: /dashboard -> Dashboard
  const title = pathname.split("/").filter(Boolean).pop() || "Dashboard";
  const capitalisedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={openSidebar}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {capitalisedTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="relative">
          {/* Mobile: Link to notifications page */}
          <Link
            href="/notifications"
            className="md:hidden relative p-2 hover:bg-muted rounded-full transition-colors text-foreground block"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
            )}
          </Link>

          {/* Desktop: Toggle notifications panel */}
          <button
            onClick={toggleNotifications}
            className="hidden md:block relative p-2 hover:bg-muted rounded-full transition-colors text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
            )}
          </button>

          {/* Desktop notifications panel */}
          <div className="hidden md:block">
            <NotificationsPanel />
          </div>
        </div>

        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
