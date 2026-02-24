import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  // Optionally add more fields if needed
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  profile?: UserProfileStore | null;
  setProfile?: (profile: UserProfileStore) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      profile: null,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, profile: null }),
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
