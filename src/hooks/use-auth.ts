import { useAuthStore } from '@/lib/store/auth-store';

export function useAuth() {
  const user = useAuthStore((state: any) => state.user);

  return {
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    isAdmin: user?.role === 'ADMIN',
  };
}
