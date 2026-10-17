"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { MOONPAY_API_KEY } from "@/lib/env";

/** How long the widget may take to initialise before we surface an error. */
const INIT_TIMEOUT_MS = 15_000;

type WidgetStatus = "loading" | "ready" | "error";

export interface MoonPayButtonProps {
  /**
   * The signed-in user's wallet address. The widget funds this address, so
   * when it is missing the control is disabled instead of crashing.
   */
  walletAddress: string | null;
  /** Optional MoonPay currency code to pre-select (e.g. "usdc"). */
  currencyCode?: string;
}

/**
 * Builds the MoonPay on-ramp URL. Never logged — it carries the API key.
 */
function buildWidgetUrl(
  apiKey: string,
  walletAddress: string,
  currencyCode?: string,
): string {
  const params = new URLSearchParams({ apiKey, walletAddress });
  if (currencyCode) params.set("currencyCode", currencyCode);
  return `https://buy.moonpay.com?${params.toString()}`;
}

/**
 * "Buy with card" on-ramp. Opens the MoonPay widget for the user's wallet.
 *
 * Fails visibly: the option is disabled with a reason when the API key or the
 * wallet address is missing, shows a loading state while the widget
 * initialises, and surfaces an error banner with Retry and Dismiss if it
 * cannot load. The URL is never logged.
 */
export function MoonPayButton({
  walletAddress,
  currencyCode,
}: MoonPayButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<WidgetStatus>("loading");
  const [reloadToken, setReloadToken] = useState(0);

  const typedAddress = walletAddress?.trim() ?? "";
  const hasKey = Boolean(MOONPAY_API_KEY);
  const hasAddress = typedAddress.length > 0;
  const disabled = !hasKey || !hasAddress;

  const disabledReason = !hasKey
    ? "Card purchases are unavailable right now."
    : !hasAddress
      ? "We couldn't load your wallet address. Please refresh and try again."
      : null;

  const widgetUrl = useMemo(() => {
    if (!hasKey || !hasAddress || !MOONPAY_API_KEY) return null;
    return buildWidgetUrl(MOONPAY_API_KEY, typedAddress, currencyCode);
  }, [hasKey, hasAddress, typedAddress, currencyCode]);

  const openWidget = useCallback(() => {
    if (disabled) return;
    setStatus("loading");
    setReloadToken((token) => token + 1);
    setOpen(true);
  }, [disabled]);

  const retry = useCallback(() => {
    setStatus("loading");
    setReloadToken((token) => token + 1);
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    setStatus("loading");
  }, []);

  // Fail over to the error state if the widget never reports it has loaded.
  useEffect(() => {
    if (!open || status !== "loading") return;
    const timer = window.setTimeout(() => setStatus("error"), INIT_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [open, status, reloadToken]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={openWidget}
        disabled={disabled}
        aria-disabled={disabled}
        title={disabledReason ?? undefined}
        className={[
          "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3",
          "text-sm font-semibold transition-colors",
          disabled
            ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
            : "bg-gray-900 text-white hover:bg-gray-800",
        ].join(" ")}
      >
        <CardIcon />
        <span>Buy with card</span>
      </button>

      {disabledReason && (
        <p role="note" className="text-xs text-gray-500">
          {disabledReason}
        </p>
      )}

      <div aria-live="polite" className="sr-only">
        {open && status === "loading"
          ? "Loading the card purchase widget."
          : ""}
        {open && status === "ready" ? "Card purchase widget ready." : ""}
      </div>

      <Dialog
        open={open}
        onClose={dismiss}
        title="Buy crypto with card"
        description="Complete your purchase in the secure MoonPay window below."
      >
        {status === "error" ? (
          <div
            role="alert"
            className="space-y-4 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm text-red-700">
              We couldn&apos;t load the card purchase widget. Please try again.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <RetryIcon />
                Retry
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          <div className="relative" aria-busy={status === "loading"}>
            {status === "loading" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                <span className="text-sm text-gray-500">Loading MoonPay…</span>
              </div>
            )}
            {widgetUrl && (
              <iframe
                key={reloadToken}
                title="MoonPay on-ramp"
                src={widgetUrl}
                onLoad={() => setStatus("ready")}
                onError={() => setStatus("error")}
                allow="accelerometer; autoplay; camera; gyroscope; payment"
                className="h-[560px] w-full rounded-lg border border-gray-200"
              />
            )}
            <span className="sr-only" role="status">
              {status === "loading" ? "Loading" : ""}
            </span>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function CardIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export default MoonPayButton;
