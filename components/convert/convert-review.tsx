"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ConvertValues } from "@/components/convert/convert-form";
import { useConvertQuote, type ConvertQuote } from "@/hooks/use-convert-quote";
import { useRemainingMs } from "@/hooks/use-remaining-ms";
import { useSubmitOnce } from "@/hooks/use-submit-once";
import { ApiError } from "@/lib/api-client";
import { createSwap, type Transaction } from "@/lib/api/transactions";
import { formatAmount, formatRate } from "@/lib/convert-amount";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { queryKeys } from "@/lib/query-keys";

export interface ConvertReviewProps {
  values: ConvertValues;
  quote: ConvertQuote;
  onBack: () => void;
  onSuccess: (transaction: Transaction, quote: ConvertQuote) => void;
}

/** Maps API failures to messages. The entered data is never cleared on error. */
export function describeSwapError(error: unknown): {
  message: string;
  quoteExpired: boolean;
} {
  if (error instanceof ApiError) {
    if (error.code === "QUOTE_EXPIRED" || error.status === 410) {
      return { message: "This quote has expired.", quoteExpired: true };
    }
    if (error.code === "INSUFFICIENT_FUNDS") {
      return {
        message:
          "You do not have enough funds for this conversion. Go back and lower the amount.",
        quoteExpired: false,
      };
    }
    if (error.isNetworkError || error.status === null || error.status >= 500) {
      return {
        message:
          "We could not reach the server. Your details are kept, so you can try again.",
        quoteExpired: false,
      };
    }
    return { message: error.message, quoteExpired: false };
  }
  return {
    message:
      "Something went wrong. Your details are kept, so you can try again.",
    quoteExpired: false,
  };
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/** One idempotency key per quote: retries reuse it, a new quote is a new intent. */
function newAttempt(quote: ConvertQuote) {
  return { quote, key: generateIdempotencyKey() };
}

export function ConvertReview({
  values,
  quote,
  onBack,
  onSuccess,
}: ConvertReviewProps) {
  const queryClient = useQueryClient();
  const [attempt, setAttempt] = useState(() => newAttempt(quote));
  const [proposed, setProposed] = useState<ConvertQuote | null>(null);
  const [serverSaysExpired, setServerSaysExpired] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [swapError, setSwapError] = useState<unknown>(null);

  const active = attempt.quote;
  const remainingMs = useRemainingMs(active.expiresAt);
  const expired = remainingMs <= 0 || serverSaysExpired;

  const { refetch, isFetching } = useConvertQuote({
    from: values.from,
    to: values.to,
    amount: values.amount,
  });

  const { handleSubmit, isSubmitting } = useSubmitOnce(
    async () => {
      setSwapError(null);
      try {
        const transaction = await createSwap(
          {
            fromCurrency: values.from,
            toCurrency: values.to,
            amount: Number(values.amount),
          },
          attempt.key,
        );
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.wallets }),
          queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
        ]);
        onSuccess(transaction, active);
      } catch (error) {
        if (describeSwapError(error).quoteExpired) setServerSaysExpired(true);
        setSwapError(error);
      }
    },
    { generateKey: false },
  );

  function handleConfirm() {
    if (expired || proposed) return;
    void handleSubmit();
  }

  async function handleRefresh() {
    setRefreshError(false);
    const result = await refetch();
    if (result.data) {
      setProposed(result.data);
    } else {
      setRefreshError(true);
    }
  }

  function handleAcceptProposed() {
    if (!proposed) return;
    setAttempt(newAttempt(proposed));
    setProposed(null);
    setServerSaysExpired(false);
    setSwapError(null);
  }

  const error = swapError ? describeSwapError(swapError) : null;
  const feeText =
    active.fee === null
      ? "Shown on your receipt"
      : `${formatAmount(active.fee, active.feeCurrency)} ${active.feeCurrency}`;

  return (
    <section
      aria-labelledby="convert-review-title"
      className="flex flex-col gap-4"
    >
      <h2 id="convert-review-title" className="text-lg font-semibold">
        Review your conversion
      </h2>

      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt>You pay</dt>
        <dd className="text-right">
          {formatAmount(values.amount, values.from)} {values.from}
        </dd>
        <dt>You receive</dt>
        <dd className="text-right">
          {formatAmount(active.toAmount, values.to)} {values.to}
        </dd>
        <dt>Rate</dt>
        <dd className="text-right">
          {formatRate(active.rate, values.from, values.to)}
        </dd>
        <dt>Fee</dt>
        <dd className="text-right">{feeText}</dd>
        <dt className="font-medium">Total</dt>
        <dd className="text-right font-medium">
          {formatAmount(values.amount, values.from)} {values.from}
          {active.fee !== null &&
            ` + ${formatAmount(active.fee, active.feeCurrency)} ${active.feeCurrency}`}
        </dd>
      </dl>

      {proposed ? (
        <div role="alert" className="rounded-md border p-3 text-sm">
          <p className="font-medium">A new quote is ready.</p>
          <p>
            You would now receive {formatAmount(proposed.toAmount, values.to)}{" "}
            {values.to} (was {formatAmount(active.toAmount, values.to)}{" "}
            {values.to}) at {formatRate(proposed.rate, values.from, values.to)}.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleAcceptProposed}
              className="rounded-md bg-black px-3 py-1 text-white"
            >
              Accept new quote
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-md border px-3 py-1"
            >
              Go back
            </button>
          </div>
        </div>
      ) : expired ? (
        <div role="alert" className="rounded-md border p-3 text-sm">
          <p>This quote has expired. Get a new quote to continue.</p>
          {refreshError && (
            <p className="text-red-600">
              We could not get a new quote. Please try again.
            </p>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="mt-2 rounded-md border px-3 py-1"
          >
            {isFetching ? "Getting quote" : "Get new quote"}
          </button>
        </div>
      ) : (
        <p role="timer" aria-live="off" className="text-sm">
          Quote expires in {formatCountdown(remainingMs)}
        </p>
      )}

      {error && !error.quoteExpired && (
        <p role="alert" className="text-sm text-red-600">
          {error.message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-md border px-4 py-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting || expired || proposed !== null}
          aria-busy={isSubmitting}
          className="flex-1 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Confirming" : "Confirm conversion"}
        </button>
      </div>
    </section>
  );
}
