'use client';

import { useAuthStore } from '@/hooks/use-auth-store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
  };
}
