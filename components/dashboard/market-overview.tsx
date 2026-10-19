"use client";

import Link from "next/link";
import { useRates } from "@/hooks/use-rates";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyIcon } from "@/components/shared/currency-icon";
import { convertHref } from "@/lib/convert-params";
import { formatMoney } from "@/lib/money";
import type { RateQuote } from "@/lib/api/exchange-rates";

function ChangeIndicator({ change }: { change: number }) {
  const up = change >= 0;
  const sign = up ? "+" : "-";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        up ? "text-green-600" : "text-red-600"
      }`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {up ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
      </svg>
      {sign}
      {Math.abs(change).toFixed(2)}%
    </span>
  );
}

function RateCard({ quote }: { quote: RateQuote }) {
  const [base, counter] = quote.pair.split("/");
  const card = (
    <div className="flex min-h-[104px] flex-col justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <CurrencyIcon code={quote.currency} />
          {quote.pair}
        </span>
        <ChangeIndicator change={quote.change24h} />
      </div>
      <p className="text-xl font-semibold text-gray-900 tabular-nums">
        {formatMoney(quote.rate, quote.currency)}
      </p>
    </div>
  );

  if (!base || !counter) return card;
  return (
    <Link
      href={convertHref(base, counter)}
      aria-label={`Convert ${base} to ${counter}`}
      className="block rounded-xl focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none"
    >
      {card}
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {[0, 1, 2].map((card) => (
        <div
          key={card}
          className="flex min-h-[104px] items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
        >
          <Skeleton width={96} height={20} />
          <Skeleton width={72} height={20} />
        </div>
      ))}
    </div>
  );
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleTimeString();
}

export function MarketOverview() {
  const {
    data,
    isPending,
    isError,
    failureCount,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useRates();
  const hasData = Boolean(data);
  const isStale = hasData && (isError || failureCount > 0);

  return (
    <section aria-labelledby="market-overview-heading" className="mt-8">
      <h2
        id="market-overview-heading"
        className="mb-4 text-lg font-semibold text-gray-900"
      >
        Market overview
      </h2>

      {isPending ? (
        <LoadingGrid />
      ) : isError && !hasData ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>We couldn&apos;t load live rates.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {isStale && (
            <div
              role="status"
              className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
            >
              <span>
                Rates may be out of date. Last updated{" "}
                {formatUpdatedAt(new Date(dataUpdatedAt).toISOString())}.
              </span>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="rounded-md border border-amber-300 px-2 py-1 font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
              >
                {isFetching ? "Refreshing…" : "Retry"}
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.quotes.map((quote) => (
              <RateCard key={quote.pair} quote={quote} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
