import { useAuthStore } from "@/hooks/use-auth-store";

/** Clears all auth state and tokens. Use after account deletion or forced logout. */
export function clearAuth(): void {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("reset-password-email");
    sessionStorage.removeItem("login-email");
  }
}
