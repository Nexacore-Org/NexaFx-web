import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setTokens as storeTokens, clearTokens as removeTokens } from "@/lib/utils/token";

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
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      setTokens: (accessToken, refreshToken) => {
        storeTokens(accessToken, refreshToken);
        set({ accessToken, refreshToken });
      },
      logout: () => {
        removeTokens();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },   
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
