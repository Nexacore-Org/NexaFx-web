'use client';

import { getProfile } from '@/lib/api/users';
import { BadgeCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function KycSection() {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getProfile();
        setKycStatus(profile.kycStatus ?? null);
      } catch {
        setKycStatus(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
        <div className="h-5 w-40 bg-muted rounded mb-3" />
        <div className="h-4 w-60 bg-muted rounded" />
      </div>
    );
  }

  const isVerified = kycStatus === 'Verified';

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        KYC Verification
      </h3>

      {isVerified ? (
        <div className="flex items-center gap-3">
          <BadgeCheck className="size-6 text-green-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              Verified
            </span>
            <p className="text-sm text-muted-foreground">
              Your identity has been verified
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-6 text-red-500 shrink-0" />
          <div className="space-y-0.5">
            <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
              Unverified
            </span>
            <p className="text-sm text-muted-foreground">
              Verification required
            </p>
          </div>
        </div>
      )}

      {!isVerified && (
        <Link
          href="#"
          className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-xs font-semibold text-black transition-colors hover:bg-primary/90 active:scale-95"
        >
          Start Verification
        </Link>
      )}
    </div>
  );
}
