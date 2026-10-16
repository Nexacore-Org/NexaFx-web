"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User, SessionStatus, isAdmin, displayName } from "../../types/user";

type AuthContextValue = {
  user: User | null;
  status: SessionStatus;
  logout: () => void;
  isAdmin: (user: User) => boolean;
  displayName: (user: User) => string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  const logout = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/profile", {
          credentials: "include",
        });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setUser(data.user ?? null);
          setStatus(data.user ? "authenticated" : "unauthenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      } catch {
        if (cancelled) return;
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    fetchSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        logout,
        isAdmin,
        displayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
