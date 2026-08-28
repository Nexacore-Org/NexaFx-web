"use client";

import { useState } from "react";
import { InfoIcon } from "@/components/ui/info-icon";
import dynamic from "next/dynamic";

const VerificationModal = dynamic(
  () =>
    import("@/components/profile/verification-modal").then(
      (mod) => mod.VerificationModal
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400" />
      </div>
    ),
    ssr: false,
  }
);

export function VerificationBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-amber-100 dark:from-gray-800 dark:via-gray-900 dark:to-amber-900/20 p-6 shadow-sm border border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">
              Verify your account Now
              <InfoIcon tooltip="KYC verification is required to access all features including withdrawals and higher transaction limits" />
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete your verification to unlock full access
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="whitespace-nowrap rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-primary/90 active:scale-95"
          >
            Verify Now
          </button>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 pointer-events-none" />
      </div>

      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
