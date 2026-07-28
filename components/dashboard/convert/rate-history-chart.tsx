"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface RatePoint {
  date: string;
  rate: number;
}

interface RateHistoryChartProps {
  data: RatePoint[];
  fromCurrency?: string;
  toCurrency?: string;
  isLoading?: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
  fromCurrency,
  toCurrency,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  fromCurrency?: string;
  toCurrency?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        1 {fromCurrency ?? "USD"} = {payload[0].value.toFixed(4)}{" "}
        {toCurrency ?? "NGN"}
      </p>
    </div>
  );
}

export function RateHistoryChart({
  data,
  fromCurrency = "USD",
  toCurrency = "NGN",
  isLoading,
}: RateHistoryChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No rate history data available.
      </div>
    );
  }

  const rates = data.map((d) => d.rate).filter((r) => Number.isFinite(r) && r > 0);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const padding = (maxRate - minRate) * 0.1 || minRate * 0.05;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {fromCurrency}/{toCurrency} Exchange Rate
        </h3>
        <div className="text-xs text-muted-foreground">
          Last {data.length} data points
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value: string) => {
                const d = new Date(value);
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              domain={[minRate - padding, maxRate + padding]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value: number) => value.toFixed(2)}
            />
            <Tooltip
              content={
                <CustomTooltip
                  fromCurrency={fromCurrency}
                  toCurrency={toCurrency}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
