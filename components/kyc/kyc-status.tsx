"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchKycStatus,
  type KycStatus,
  type KycStatusResponse,
} from "@/lib/api/kyc";
import { KycWizard } from "@/components/kyc/kyc-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function KycStatusView() {
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<
    KycStatusResponse,
    Error
  >({
    queryKey: ["kyc-status"],
    queryFn: fetchKycStatus,
    // Poll every 10 seconds while status is "pending", disable polling on terminal states
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" ? 10_000 : false;
    },
  });

  const status: KycStatus = data?.status ?? "not_started";
  const requiredMethod = data?.requiredMethod;

  const handleWizardSuccess = () => {
    setWizardOpen(false);
    queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
  };

  const statusConfig: Record<
    KycStatus,
    {
      label: string;
      title: string;
      description: string;
      badgeClass: string;
      ctaText: string | null;
      icon: string;
    }
  > = {
    not_started: {
      label: "Not Verified",
      title: "Identity Verification Required",
      description:
        "Verify your identity to increase transaction limits, access direct local bank withdrawals, and ensure account security.",
      badgeClass:
        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
      ctaText: "Start Verification",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    },
    pending: {
      label: "Under Review",
      title: "Verification In Progress",
      description:
        "Your verification documents are currently being processed by our compliance team. This typically takes a few minutes to 24 hours.",
      badgeClass:
        "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
      ctaText: null,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    approved: {
      label: "Verified",
      title: "Identity Verified",
      description:
        "Your account is fully verified. You enjoy maximum transaction limits and unlocked multi-currency features.",
      badgeClass:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
      ctaText: null,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    rejected: {
      label: "Verification Failed",
      title: "Verification Not Approved",
      description:
        data?.rejectionReason ??
        "Your documents could not be validated. Please check the details and submit clear, unedited documents.",
      badgeClass:
        "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
      ctaText: "Resubmit Verification",
      icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const currentConfig = statusConfig[status];

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="space-y-4">
          <Skeleton height="160px" />
          <Skeleton height="240px" />
        </div>
      )}

      {isError && (
        <EmptyState
          variant="error"
          title="Failed to load KYC status"
          description="We couldn't retrieve your verification details. Please try again."
          retry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (
        <>
          {/* Main Status Banner Card */}
          <section
            aria-labelledby="kyc-status-title"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  aria-hidden="true"
                >
                  <svg
                    className="h-6 w-6 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={currentConfig.icon} />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2
                      id="kyc-status-title"
                      className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                    >
                      {currentConfig.title}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentConfig.badgeClass}`}
                    >
                      {currentConfig.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {currentConfig.description}
                  </p>

                  {status === "pending" && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                      </span>
                      <span>Status auto-refreshes periodically</span>
                    </div>
                  )}
                </div>
              </div>

              {currentConfig.ctaText && (
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="shrink-0 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {currentConfig.ctaText}
                </button>
              )}
            </div>
          </section>

          {/* Tiers & Limits Section */}
          <section
            aria-labelledby="tiers-heading"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-4">
              <h3
                id="tiers-heading"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Verification Tiers & Limits
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Unlock higher transaction limits by completing verification
                steps.
              </p>
            </div>

            {/* Note: Limits are ONLY rendered if the API provides them, avoiding fabricated limits */}
            {data?.limitsAvailable && data.tiers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <th className="pr-4 pb-3">Tier</th>
                      <th className="pr-4 pb-3">Per Transaction</th>
                      <th className="pr-4 pb-3">Daily Limit</th>
                      <th className="pb-3">Monthly Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {data.tiers.map((tier) => (
                      <tr
                        key={tier.id}
                        className="text-zinc-800 dark:text-zinc-200"
                      >
                        <td className="py-3 pr-4 font-medium">{tier.label}</td>
                        <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                          {tier.limits?.perTransaction
                            ? `$${tier.limits.perTransaction.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                          {tier.limits?.perDay
                            ? `$${tier.limits.perDay.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400">
                          {tier.limits?.perMonth
                            ? `$${tier.limits.perMonth.toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-50 p-4 text-xs text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
                <p>
                  Limits are calculated based on your jurisdiction and account
                  activity. Complete verification to remove tier restrictions.
                </p>
              </div>
            )}
          </section>

          {/* Verification Modal Wizard */}
          <KycWizard
            open={wizardOpen}
            onClose={() => setWizardOpen(false)}
            onComplete={handleWizardSuccess}
            defaultMethod={requiredMethod}
          />
        </>
      )}
    </div>
  );
}
