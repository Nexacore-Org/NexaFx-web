"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ApiErrorState } from "@/components/shared/api-error-state";

function CopyIcon() {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface WalletAddressCardProps {
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function WalletAddressCard({
  walletAddress,
  isLoading,
  error,
  onRetry,
}: WalletAddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
    } catch {
      // Clipboard API failed silently — nothing we can recover from
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-40 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ApiErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col items-center gap-6">
        {/* QR Code */}
        <div className="rounded-lg bg-white p-3 shadow-sm">
          {walletAddress ? (
            <QRCodeSVG
              value={walletAddress}
              size={192}
              level="M"
              marginSize={2}
              aria-label="Wallet address QR code"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              No wallet address available
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div className="w-full rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Wallet Address
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all text-sm font-mono text-zinc-900 dark:text-zinc-100">
              {walletAddress || "—"}
            </code>
            {walletAddress && (
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                aria-label={copied ? "Address copied" : "Copy wallet address"}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            )}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={!walletAddress}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {copied ? (
            <>
              <CheckIcon />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon />
              Copy Address
            </>
          )}
        </button>
      </div>
    </div>
  );
}
