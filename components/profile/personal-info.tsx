'use client';

import { UserProfile, getProfile } from '@/lib/api/users';
import { useEffect, useState } from 'react';

import { Eye } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth-store';

export function PersonalInfo() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      getProfile()
        .then((data) => setProfile(data))
        .catch((e) => setError(e.message || 'Failed to load profile'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const name =
    user?.name || (profile ? `${profile.firstName} ${profile.lastName}` : '');
  const email = user?.email || profile?.email || '';
  const phone = profile?.phone || '';

  if (loading) {
    return (
      <div className="bg-white dark:bg-card border border-border/50 rounded-xl p-6 shadow-sm animate-pulse h-[150px]" />
    );
  }
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-card border border-border/50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-base font-semibold text-foreground">
          Personal Info
        </h3>
        <Eye className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1 border-b border-border/10 last:border-0">
          <span className="text-sm text-muted-foreground w-1/3">Name</span>
          <span className="text-sm font-medium text-foreground text-right">
            {name}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1 border-b border-border/10 last:border-0">
          <span className="text-sm text-muted-foreground w-1/3">
            Email address
          </span>
          <span className="text-sm font-medium text-foreground text-right">
            {email}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-1 border-b border-border/10 last:border-0">
          <span className="text-sm text-muted-foreground w-1/3">
            Phone Number
          </span>
          <span className="text-sm font-medium text-foreground text-right">
            {phone}
          </span>
        </div>
      </div>
    </div>
  );
}
