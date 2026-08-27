"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState } from "react";

type Period = "6M" | "1Y" | "All";

const data6M = [
  { month: "Jan", volume: 45000, pair: "USD/NGN" },
  { month: "Feb", volume: 52000, pair: "USD/NGN" },
  { month: "Mar", volume: 38000, pair: "USD/NGN" },
  { month: "Apr", volume: 61000, pair: "EUR/NGN" },
  { month: "May", volume: 48000, pair: "USD/NGN" },
  { month: "Jun", volume: 55000, pair: "EUR/NGN" },
];

const data1Y = [
  { month: "Jul", volume: 42000, pair: "USD/NGN" },
  { month: "Aug", volume: 39000, pair: "USD/NGN" },
  { month: "Sep", volume: 53000, pair: "EUR/NGN" },
  { month: "Oct", volume: 47000, pair: "USD/NGN" },
  { month: "Nov", volume: 58000, pair: "USD/NGN" },
  { month: "Dec", volume: 50000, pair: "GBP/NGN" },
  ...data6M,
];

const dataAll = [
  ...data1Y,
  { month: "Jul (prev)", volume: 35000, pair: "USD/NGN" },
  { month: "Aug (prev)", volume: 41000, pair: "EUR/NGN" },
  { month: "Sep (prev)", volume: 46000, pair: "USD/NGN" },
  { month: "Oct (prev)", volume: 52000, pair: "USD/NGN" },
  { month: "Nov (prev)", volume: 38000, pair: "GBP/NGN" },
  { month: "Dec (prev)", volume: 44000, pair: "USD/NGN" },
];

const mockData: Record<Period, { month: string; volume: number; pair: string }[]> = {
  "6M": data6M,
  "1Y": data1Y,
  "All": dataAll,
};

const periods: Period[] = ["6M", "1Y", "All"];

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-muted rounded" />
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

export function ConversionHistory() {
  const [period, setPeriod] = useState<Period>("6M");
  const [loading] = useState(false);
  const data = mockData[period];

  if (loading) {
    return (
      <section className="bg-card rounded-xl p-4 md:p-6 border border-border">
        <ChartSkeleton />
      </section>
    );
  }

  return (
    <section className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Conversion History
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monthly conversion volume
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barSize={28}
            barCategoryGap="20%"
            margin={{ top: 8, right: 0, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              width={40}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
              }
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                "Volume",
              ]}
              labelFormatter={(label) => {
                const entry = data.find((d) => d.month === label);
                return entry ? `${label} - ${entry.pair}` : label;
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]} fill="#FFD552" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
