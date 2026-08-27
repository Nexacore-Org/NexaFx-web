import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as Sentry from "@sentry/nextjs";
import { setTokens as storeTokens, clearTokens as removeTokens } from "@/lib/utils/token";

/**
 * Auth tokens currently have two client-side storage representations: the
 * access and refresh tokens are written directly to localStorage as
 * `access_token` and `refresh_token` (and mirrored to cookies for the server
 * proxy), while Zustand persist writes the same values in its `auth-storage`
 * blob. The store is the application state source of truth today, but the
 * duplicate storage paths must remain synchronized until issue #745,
 * "Consolidate auth token storage to a single source of truth", is resolved.
 */

export interface UserProfileStore {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // derived from firstName + lastName
  email: string;
  role: "USER" | "ADMIN";
  // Optionally add more fields if needed
}


interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  profile?: UserProfileStore | null;
  setProfile?: (profile: UserProfileStore) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        storeTokens(accessToken, refreshToken);
        Sentry.setUser({ id: user.id, email: user.email });
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      setTokens: (accessToken, refreshToken) => {
        storeTokens(accessToken, refreshToken);
        set({ accessToken, refreshToken });
      },
      logout: () => {
        removeTokens();
        Sentry.setUser(null);
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },   
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
