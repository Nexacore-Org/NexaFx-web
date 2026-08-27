import { create } from 'zustand';
import * as Sentry from '@sentry/nextjs';

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
  setAuth: (user, accessToken, refreshToken) => {
    Sentry.setUser({
      id: typeof user.id === 'string' ? user.id : undefined,
      email: typeof user.email === 'string' ? user.email : undefined,
    });
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },
  clearAuth: () => {
    Sentry.setUser(null);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
  updateTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
}));
