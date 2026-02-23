"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { user, isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!token || !isAuthenticated) {
      router.push("/sign-in");
    } else if (user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isMounted, token, isAuthenticated, user, router]);

  if (!isMounted || !token || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]" />
      </div>
    );
  }

  return <>{children}</>;
}
