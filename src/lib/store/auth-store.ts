import { create } from 'zustand';

interface UserPayload {
  firstName?: string;
  lastName?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthState {
  user: UserPayload | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserPayload, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken, isAuthenticated: true }),
  clearAuth: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
  updateTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
}));
