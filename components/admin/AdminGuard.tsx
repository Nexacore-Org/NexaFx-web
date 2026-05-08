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

  if (!accessToken || !isAuthenticated) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]' />
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#F39A00]' />
    </div>
  );
}
