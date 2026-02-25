"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";

// Set to true to bypass auth for testing/development
const BYPASS_AUTH = true;

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, token, setAuth } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Bypass auth for development/testing
    if (BYPASS_AUTH) {
      if (!token || !isAuthenticated) {
        // Set mock admin user
        setAuth(
          {
            id: "admin-1",
            name: "Admin User",
            email: "admin@nexafx.com",
            role: "ADMIN",
          },
          "mock-admin-token"
        );
      }
      return;
    }

    if (!token || !isAuthenticated) {
      router.push("/sign-in");
    } else if (user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isMounted, token, isAuthenticated, user, router, setAuth]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]" />
      </div>
    );
  }

  // Allow access if bypassing auth or properly authenticated
  if (BYPASS_AUTH || (token && isAuthenticated && user?.role === "ADMIN")) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]" />
    </div>
  );
}
