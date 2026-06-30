"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, ArrowDown } from "lucide-react";

import { Sidebar } from "../../components/dashboard/sidebar";
import { Topbar } from "../../components/dashboard/topbar";
import { NetworkStatusBanner } from "@/components/shared/network-status-banner";
import { AnnouncementBanner } from "@/components/shared/announcement-banner";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../hooks/use-auth-store";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "../../hooks/use-sidebar-store";
import { useRealtimeBalance } from "@/hooks/use-realtime-balance";
import { RealtimeIndicator } from "@/components/dashboard/realtime-indicator";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, close } = useSidebarStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isAuthenticated, accessToken } = useAuthStore();
  const router = useRouter();
  useRealtimeBalance();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, accessToken, router]);

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-all duration-300">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden md:block transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </aside>

      {/* Sidebar - Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-300"
          onClick={close}
        />
      )}

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-70 transform transition-transform duration-300 ease-in-out md:hidden bg-white dark:bg-black",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {pullDistance > 0 && (
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center transition-all"
            style={{
              height: pullDistance,
              transform: `translateY(${isRefreshing ? 0 : -pullDistance}px)`,
            }}
          >
            <div
              className={`flex items-center justify-center gap-2 text-sm font-medium ${
                pullDistance >= 80 ? "text-yellow-500" : "text-muted-foreground"
              }`}
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowDown
                  className={`w-5 h-5 transition-transform ${
                    pullDistance >= 80 ? "rotate-180" : ""
                  }`}
                />
              )}
              {isRefreshing
                ? "Refreshing..."
                : pullDistance >= 80
                  ? "Release to refresh"
                  : "Pull to refresh"}
            </div>
          </div>
        )}
        <NetworkStatusBanner />
        <div className="p-4 md:px-8 flex items-center gap-3">
          <div className="flex-1">
            <Topbar />
          </div>
          <RealtimeIndicator />
        </div>
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
          <div key={refreshingKey}>{children}</div>
        </main>
      </div>
    </div>
  );
}
