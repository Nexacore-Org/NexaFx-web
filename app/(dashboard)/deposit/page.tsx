"use client";

import { useState, useEffect } from "react";
import { WalletAddressCard } from "@/components/dashboard/deposit/wallet-address-card";
import { MoonPayButton } from "@/components/dashboard/deposit/moonpay-button";
import { getUserProfile, type UserProfile } from "@/lib/api/users";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import Link from "next/link";
import { Info, Loader2 } from "lucide-react";

type DepositLimits = {
  minDeposit: number;
  maxDepositPerTx: number;
  dailyLimit: number;
  feePercentage: number;
  estimatedArrival: string;
};

const defaultLimits: DepositLimits = {
  minDeposit: 1000,
  maxDepositPerTx: 10000000,
  dailyLimit: 50000000,
  feePercentage: 0,
  estimatedArrival: "10-30 minutes",
};

function DepositLimitsCard() {
  const [limits, setLimits] = useState<DepositLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLimits(defaultLimits);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Deposit Limits & Fees
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : limits ? (
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Minimum Deposit</span>
            <span className="font-medium text-foreground">
              ₦{limits.minDeposit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Max per Transaction</span>
            <span className="font-medium text-foreground">
              ₦{limits.maxDepositPerTx.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Daily Deposit Limit</span>
            <span className="font-medium text-foreground">
              ₦{limits.dailyLimit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Deposit Fee</span>
            <span className="font-medium text-foreground">
              {limits.feePercentage}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated Arrival</span>
            <span className="font-medium text-foreground">
              {limits.estimatedArrival}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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

      <ErrorBoundary sectionName="Deposit - Limits & Fees">
        <DepositLimitsCard />
      </ErrorBoundary>

      <ErrorBoundary sectionName="Deposit - MoonPay">
        <MoonPayButton
          walletAddress={profile?.walletAddress ?? null}
        />
      </ErrorBoundary>
    </div>
  );
}
