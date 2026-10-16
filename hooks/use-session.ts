import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, SessionStatus } from "../types/user";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const router = useRouter();

  const logout = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    router.push("/login");
    // Clear TanStack Query cache - would be integrated with query provider
  }, [router]);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/profile", {
          credentials: "include",
        });
        if (res.status === 401) {
          setStatus("unauthenticated");
          setUser(null);
        } else if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setStatus(data.user ? "authenticated" : "unauthenticated");
        } else {
          setStatus("unauthenticated");
          setUser(null);
        }
      } catch {
        setStatus("unauthenticated");
        setUser(null);
      } finally {
        setStatus("authenticated");
      }
    }
    fetchSession();
  }, [router]);

  return { user, status, logout };
}
