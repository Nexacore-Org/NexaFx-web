"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const fullName = store.user
    ? `${store.user.firstName} ${store.user.lastName}`.trim()
    : "";
  const isAdmin = store.user?.role === "ADMIN";

  const logout = () => {
    store.clearAuth();
    router.push("/sign-in");
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    fullName,
    isAdmin,
    logout,
  };
}
