'use client';

import { UserProfile, getProfile } from '@/lib/api/users';
import { useEffect, useState } from 'react';

import { Copy } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth-store';

export function ProfileOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProfile()
      .then((data) => {
        if (mounted) {
          setProfile(data);
          setAuth(
            {
              id: data.id,
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              role: 'USER',
            },
            localStorage.getItem('token') || '',
          );
        }
      })
      .catch((e) => {
        if (mounted) setError(e.message || 'Failed to load profile');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [setAuth]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-xl p-8 border border-border/50 shadow-sm flex flex-col items-center text-center space-y-4 h-full min-h-[300px] justify-center animate-pulse">
        <div className="h-24 w-24 rounded-2xl bg-muted" />
        <div className="h-6 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="text-red-500 text-center">
        {error || 'No profile data'}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card rounded-xl p-8 border border-border/50 shadow-sm flex flex-col items-center text-center space-y-4 h-full min-h-[300px] justify-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-2xl bg-[#5E5699] flex items-center justify-center overflow-hidden shadow-lg">
          <img
            src={
              profile.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName}`
            }
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">
          {profile.firstName} {profile.lastName}
        </h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm cursor-pointer hover:text-foreground transition-colors group">
          <span>{profile.email}</span>
          <Copy className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
        </div>
        {profile.phone && (
          <div className="text-xs text-muted-foreground">{profile.phone}</div>
        )}
      </div>

      <div className="pt-2">
        <span
          className={`inline-flex items-center rounded-full px-6 py-1.5 text-sm font-medium border ${profile.isVerified ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'}`}
        >
          {profile.isVerified ? 'Verified' : 'Unverified'}
        </span>
      </div>
    </div>
  );
}
