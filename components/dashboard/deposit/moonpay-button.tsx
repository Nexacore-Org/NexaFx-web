"use client";

import { useState } from "react";

function ExternalLinkIcon() {
  return (
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

interface MoonPayButtonProps {
  walletAddress: string | null;
}

export function MoonPayButton({ walletAddress }: MoonPayButtonProps) {
  const [moonPayError, setMoonPayError] = useState(false);

  const handleMoonPayOpen = () => {
    const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY;

    if (!apiKey) {
      console.error(
        "MoonPay: NEXT_PUBLIC_MOONPAY_API_KEY is not set. Deployment requires this environment variable.",
      );
      setMoonPayError(true);
      return;
    }

    if (!walletAddress) {
      return;
    }

    setMoonPayError(false);
    const url = new URL("https://buy.moonpay.com");
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("walletAddress", walletAddress);
    url.searchParams.set("currencyCode", "usdc");
    url.searchParams.set("baseCurrencyCode", "ngn");
    window.open(url.toString(), "_blank");
  };

  const isDisabled = !walletAddress;

  return (
    <div className="space-y-3">
      {/* Visible error banner when MoonPay is not configured */}
      {moonPayError && (
        <div
          className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            MoonPay is not configured — please contact support
          </p>
        </div>
      )}

      <button
        onClick={handleMoonPayOpen}
        disabled={isDisabled}
        title={isDisabled ? "Wallet address is loading…" : undefined}
        className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-zinc-100 p-2 dark:bg-zinc-800">
            <ExternalLinkIcon />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Buy Crypto (via MoonPay)
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Buy crypto instantly through MoonPay
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Fee: 0%
            </p>
          </div>
        </div>
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
          className="shrink-0 text-zinc-400"
          aria-hidden="true"
        >
          <path d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      </button>
    </div>
  );
}
