"use client";

import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { GeoData } from "@/lib/api/admin";

// ─── Country flag emoji helper ──────────────────────────────────────────────

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// ─── Trend indicator ────────────────────────────────────────────────────────

function TrendBadge({ value }: { value: number }) {
  const isUp = value > 0;
  const isDown = value < 0;
  const isFlat = value === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        isUp && "bg-green-50 text-green-700",
        isDown && "bg-red-50 text-red-700",
        isFlat && "bg-gray-50 text-gray-500",
      )}
    >
      {isUp && <TrendingUp className="h-3 w-3" />}
      {isDown && <TrendingDown className="h-3 w-3" />}
      {isFlat && <Minus className="h-3 w-3" />}
      {isUp ? "+" : ""}
      {value}%
    </span>
  );
}

// ─── Volume formatter ───────────────────────────────────────────────────────

function formatVolume(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface GeoDistributionProps {
  data: GeoData[];
  loading?: boolean;
  error?: string | null;
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function GeoDistributionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-2.5 w-32 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// ─── Error state ────────────────────────────────────────────────────────────

function GeoDistributionError({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <Globe className="h-8 w-8 text-red-400 mx-auto mb-2" />
      <h3 className="text-sm font-semibold text-red-800 mb-1">
        Failed to load geographic data
      </h3>
      <p className="text-xs text-red-600">{message}</p>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function GeoDistributionEmpty() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
      <Globe className="h-10 w-10 text-gray-300 mx-auto mb-3" />
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        No geographic data yet
      </h3>
      <p className="text-xs text-gray-500">
        Transaction location data will appear here once users start transacting
        from different regions.
      </p>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function GeoDistribution({ data, loading, error }: GeoDistributionProps) {
  if (loading) return <GeoDistributionSkeleton />;
  if (error) return <GeoDistributionError message={error} />;
  if (!data || data.length === 0) return <GeoDistributionEmpty />;

  // Sort by transaction count descending for the table
  const sortedByCount = [...data].sort(
    (a, b) => b.transactionCount - a.transactionCount,
  );

  // Top 10 for the table
  const topCountries = sortedByCount.slice(0, 10);

  // For the chart: use top 8 to keep it readable
  const chartData = sortedByCount
    .slice(0, 8)
    .map((item) => ({
      name: item.countryName,
      short: item.country,
      count: item.transactionCount,
      volume: item.totalVolume,
    }));

  // Calculate max for proportional bar widths
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Chart colours — warm gradient
  const CHART_COLORS = [
    "#F97316", // orange
    "#FB923C",
    "#FBA94C",
    "#FBBF24",
    "#FCD34D",
    "#86EFAC",
    "#4ADE80",
    "#22C55E",
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-orange-50 p-2">
              <Globe className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Geographic Distribution
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Top {topCountries.length} countries by transaction activity
              </p>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            {data.reduce((sum, d) => sum + d.transactionCount, 0).toLocaleString()} total txns
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
        {/* ─── Left: Top Countries Table ─── */}
        <div className="p-6 border-r-0 lg:border-r border-gray-100">
          <div className="space-y-0.5">
            {/* Table header */}
            <div className="grid grid-cols-[32px_1fr_auto_auto] gap-3 px-1.5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <span />
              <span>Country</span>
              <span className="text-right">Transactions</span>
              <span className="text-right w-20">Volume</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-50">
              {topCountries.map((country, index) => {
                const totalVolume = data.reduce(
                  (sum, d) => sum + d.totalVolume,
                  0,
                );
                const volumeShare =
                  totalVolume > 0
                    ? Math.round(
                        (country.totalVolume / totalVolume) * 100,
                      )
                    : 0;

                return (
                  <div
                    key={country.country}
                    className="grid grid-cols-[32px_1fr_auto_auto] gap-3 items-center px-1.5 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {/* Rank */}
                    <span className="text-xs font-semibold text-gray-400 text-center">
                      {index + 1}
                    </span>

                    {/* Country name + flag */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg leading-none shrink-0" role="img" aria-label={country.countryName}>
                        {getFlagEmoji(country.country)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {country.countryName}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {country.transactionCount.toLocaleString()} transactions
                        </p>
                      </div>
                    </div>

                    {/* Transaction count */}
                    <span className="text-sm font-semibold text-gray-900 text-right tabular-nums">
                      {country.transactionCount.toLocaleString()}
                    </span>

                    {/* Volume + share */}
                    <div className="text-right w-20">
                      <p className="text-sm font-semibold text-gray-900 tabular-nums">
                        {formatVolume(country.totalVolume)}
                      </p>
                      <TrendBadge value={volumeShare} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Right: Horizontal Bar Chart ─── */}
        <div className="p-6">
          <div className="h-full flex flex-col">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Transaction Volume by Country
            </p>

            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  barSize={22}
                  barGap={4}
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                    tickFormatter={(v) => v.toLocaleString()}
                    width={50}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(value: number, name: string) => {
                      if (name === "count") return [value.toLocaleString(), "Transactions"];
                      return [formatVolume(value), "Volume"];
                    }}
                    labelFormatter={(label: string) => label}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.short}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        className="transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
