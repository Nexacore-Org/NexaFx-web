"use client";

import { useState, useEffect } from "react";
import { WalletAddressCard } from "@/components/dashboard/deposit/wallet-address-card";
import { MoonPayButton } from "@/components/dashboard/deposit/moonpay-button";
import { getUserProfile, type UserProfile } from "@/lib/api/users";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import Link from "next/link";

export default function DepositPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserProfile();
        if (!cancelled) {
          setProfile(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load profile";
          setError(message);
          console.error("Failed to fetch user profile:", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8 px-4">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back to Home
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Deposit
      </h1>

      <ErrorBoundary sectionName="Deposit - Wallet Address">
        <WalletAddressCard
          walletAddress={profile?.walletAddress ?? null}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
      </ErrorBoundary>

      <ErrorBoundary sectionName="Deposit - MoonPay">
        <MoonPayButton
          walletAddress={profile?.walletAddress ?? null}
        />
      </ErrorBoundary>
    </div>
  );
}
