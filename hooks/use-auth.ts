import { useAuthStore } from "@/lib/store/auth-store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "";

  const isAdmin = user?.role === "ADMIN";

  return { user, isAuthenticated, fullName, isAdmin, logout: clearAuth };
}
