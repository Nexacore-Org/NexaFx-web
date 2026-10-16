"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserLimits, type UserLimits } from "@/lib/api/limits";
import { usedPercent } from "@/lib/validation/withdraw";
import { formatMoney } from "@/lib/money";

function ProgressBar({
  used,
  limit,
  currency,
  label,
}: {
  used: number;
  limit: number;
  currency: string;
  label: string;
}) {
  const pct = usedPercent(used, limit);
  const remaining = limit - used;
  const isNearLimit = pct >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        <span className="text-zinc-500 dark:text-zinc-500">
          {formatMoney(remaining, currency)} {currency} remaining
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
        role="progressbar"
        aria-label={`${label} limit`}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit
              ? "bg-amber-500 dark:bg-amber-400"
              : "bg-blue-500 dark:bg-blue-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
        <span>
          {formatMoney(used, currency)} {currency} used
        </span>
        <span>
          {formatMoney(limit, currency)} {currency} limit
        </span>
      </div>
    </div>
  );
}

interface LimitIndicatorInnerProps {
  limits: UserLimits;
}

function LimitIndicatorInner({ limits }: LimitIndicatorInnerProps) {
  const tierLabel: Record<string, string> = {
    basic: "Basic",
    verified: "Verified",
    premium: "Premium",
  };

  const canUpgrade = limits.tier !== "premium";

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Withdrawal Limits
        </h3>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          {tierLabel[limits.tier] ?? limits.tier} tier
        </span>
      </div>

      <ProgressBar
        used={limits.daily.used}
        limit={limits.daily.limit}
        currency={limits.currency}
        label="Daily"
      />

      <ProgressBar
        used={limits.monthly.used}
        limit={limits.monthly.limit}
        currency={limits.currency}
        label="Monthly"
      />

      {canUpgrade && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Complete{" "}
          <a
            href="/kyc"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            KYC verification
          </a>{" "}
          to raise your limits.
        </p>
      )}
    </div>
  );
}

export interface LimitIndicatorProps {
  /** Optional: provide pre-fetched limits to skip the internal query. */
  limits?: UserLimits | null;
}

/**
 * Displays the user's daily and monthly withdrawal limits with progress bars.
 * Hides entirely when limit data is unavailable (no fabricated values).
 */
export function LimitIndicator({ limits: propLimits }: LimitIndicatorProps) {
  const query = useQuery({
    queryKey: ["user-limits"],
    queryFn: fetchUserLimits,
    staleTime: 60_000,
    // Skip if the caller already supplied limits
    enabled: propLimits === undefined,
  });

  const limits = propLimits !== undefined ? propLimits : query.data;

  // Hide the indicator when data is unavailable rather than showing blanks.
  if (!limits) return null;

  return <LimitIndicatorInner limits={limits} />;
}
