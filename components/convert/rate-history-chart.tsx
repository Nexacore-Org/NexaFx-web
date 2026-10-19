"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RATE_RANGES,
  getRateHistory,
  type RatePoint,
  type RateRange,
} from "@/lib/api/rates";
import { formatAmount } from "@/lib/convert-amount";
import { queryKeys } from "@/lib/query-keys";

function ChartSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-60 w-full animate-pulse rounded-md bg-gray-200"
    />
  );
}

// recharts is heavy, so the canvas is a separate chunk that is only fetched
// once there is data to draw. No ssr:false: nothing here needs the browser
// until the chunk runs.
const RateChartCanvas = dynamic(
  () => import("@/components/convert/rate-chart-canvas"),
  { loading: () => <ChartSkeleton /> },
);

export interface RateSummary {
  start: number;
  end: number;
  high: number;
  low: number;
  /** Percentage change from start to end. */
  change: number;
}

export function summarizeRates(points: RatePoint[]): RateSummary | null {
  if (points.length === 0) return null;
  const rates = points.map((point) => point.rate);
  const start = rates[0];
  const end = rates[rates.length - 1];
  return {
    start,
    end,
    high: Math.max(...rates),
    low: Math.min(...rates),
    change: start === 0 ? 0 : ((end - start) / start) * 100,
  };
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function RateHistoryChart({ from, to }: { from: string; to: string }) {
  const [range, setRange] = useState<RateRange>("30D");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKeys.rates(from), "history", to, range],
    queryFn: () => getRateHistory({ from, to, range }),
    enabled: from !== to,
  });

  const summary = data ? summarizeRates(data) : null;
  const pair = `${from} to ${to}`;

  return (
    <section
      aria-labelledby="rate-history-title"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h2 id="rate-history-title" className="text-base font-semibold">
          Rate history, {pair}
        </h2>
        <Tabs
          value={range}
          onValueChange={(value) => setRange(value as RateRange)}
        >
          <TabsList aria-label="Rate history range">
            {RATE_RANGES.map((value) => (
              <TabsTrigger key={value} value={value}>
                {value}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div role="status" aria-busy="true">
          <ChartSkeleton />
          <span className="sr-only">Loading rate history</span>
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-md border p-3 text-sm">
          <p>Rate history is unavailable right now.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-2 rounded-md border px-3 py-1"
          >
            Try again
          </button>
        </div>
      ) : !data || data.length === 0 || !summary ? (
        <p role="status" className="text-sm">
          No rate history is available for {pair} in this range.
        </p>
      ) : (
        <>
          <p className="text-sm">
            Over {range}: started at {formatAmount(summary.start, to)}, now{" "}
            {formatAmount(summary.end, to)} ({summary.change >= 0 ? "+" : ""}
            {summary.change.toFixed(2)}%). High {formatAmount(summary.high, to)}
            , low {formatAmount(summary.low, to)}.
          </p>
          <div aria-hidden="true">
            <RateChartCanvas points={data} />
          </div>
          <table className="sr-only">
            <caption>
              {pair} exchange rate, {range}
            </caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.timestamp}>
                  <td>{dateFormat.format(Date.parse(point.timestamp))}</td>
                  <td>{formatAmount(point.rate, to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
