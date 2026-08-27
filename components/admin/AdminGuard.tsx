'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
    } else if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Not authenticated — show loading while redirecting to sign-in
  if (!accessToken || !isAuthenticated) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-3'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]' />
        <p className='text-sm text-muted-foreground'>Verifying authentication...</p>
      </div>
    );
  }

  // Authenticated as ADMIN — render children
  if (user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Authenticated but not ADMIN — show redirecting state
  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-3'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]' />
      <p className='text-sm text-muted-foreground'>Redirecting...</p>
    </div>
  );
}
