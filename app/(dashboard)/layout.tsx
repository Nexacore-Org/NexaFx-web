'use client';

import { useState } from 'react';

import { Sidebar } from "../../components/dashboard/sidebar";
import { Topbar } from "../../components/dashboard/topbar";
import { NetworkStatusBanner } from "@/components/shared/network-status-banner";
import { SessionTimeoutModal } from "@/components/shared/session-timeout-modal";
import { AuthGuard } from "@/components/shared/auth-guard";
import { DashboardErrorBoundary } from "@/components/shared/error-boundary";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../lib/store/auth-store";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "../../hooks/use-sidebar-store";
import { useSessionTimeout } from "@/hooks/use-session-timeout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, close } = useSidebarStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { clearAuth: logout, updateTokens } = useAuthStore();
  const router = useRouter();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(2 * 60 * 1000); // 2 minutes

  const handleStaySignedIn = async () => {
    try {
      const refreshTokenStr = typeof window !== "undefined" 
        ? localStorage.getItem("refresh_token") 
        : null;
      
      if (refreshTokenStr) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refreshTokenStr }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;
          if (newAccessToken && newRefreshToken) {
            updateTokens(newAccessToken, newRefreshToken);
            return;
          }
        }
      }
      throw new Error("Failed to refresh token");
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      router.push("/sign-in");
    }
  };

  const handleTimeout = () => {
    logout();
    router.push("/sign-in");
  };

  const handleWarn = () => {
    setShowSessionModal(true);
    setRemainingTime(2 * 60 * 1000); // 2 minutes
  };

  useSessionTimeout({
    onWarn: handleWarn,
    onTimeout: handleTimeout,
  });

  return (
    <AuthGuard>
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

        <div className="flex flex-1 flex-col overflow-hidden">
          <NetworkStatusBanner />
          <div className="p-4 md:px-8">
            <Topbar />
          </div>
          <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
            <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
          </main>
        </div>

        <SessionTimeoutModal
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          onStaySignedIn={handleStaySignedIn}
          remainingTimeMs={remainingTime}
        />
      </div>
    </AuthGuard>
  );
}
