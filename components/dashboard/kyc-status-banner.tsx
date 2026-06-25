'use client';

import { getProfile } from '@/lib/api/users';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'kyc-banner-dismissed';

export function KYCStatusBanner() {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

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

  if (loading) return null;

  const isVerified = kycStatus === 'Verified';
  if (isVerified) return null;

  const isDismissed =
    dismissed || localStorage.getItem(DISMISS_KEY) === 'true';
  if (isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 p-4 shadow-sm border border-amber-200 dark:border-amber-800">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-6">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            Your account is not yet verified
          </p>
          <p className="text-xs text-muted-foreground">
            Complete KYC to unlock full transaction limits.
          </p>
        </div>
        <Link
          href="/settings"
          className="whitespace-nowrap rounded-md bg-primary px-5 py-2 text-xs font-semibold text-black transition-colors hover:bg-primary/90 active:scale-95"
        >
          Verify Now
        </Link>
      </div>
    </div>
  );
}
