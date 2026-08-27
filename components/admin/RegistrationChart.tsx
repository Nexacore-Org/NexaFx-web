"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  getRegistrationTrends,
  type RegistrationDataPoint,
} from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "7d" | "30d" | "90d" | "1y";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1 Year" },
];

export function RegistrationChart() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<RegistrationDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getRegistrationTrends(period);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const totalUsers =
    data.length > 0 ? data[data.length - 1].cumulativeUsers : 0;
  const totalNew = data.reduce((sum, d) => sum + d.newUsers, 0);
  const avgDaily =
    data.length > 0 ? (totalNew / data.length).toFixed(1) : "0";

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstHalfSum = firstHalf.reduce((s, d) => s + d.newUsers, 0);
  const secondHalfSum = secondHalf.reduce((s, d) => s + d.newUsers, 0);
  const growthRate =
    firstHalfSum > 0
      ? (((secondHalfSum - firstHalfSum) / firstHalfSum) * 100).toFixed(1)
      : "0";

  const peakDay = data.reduce(
    (max, d) => (d.newUsers > max.newUsers ? d : max),
    { newUsers: 0, date: "", cumulativeUsers: 0 }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-medium">
            Total Users
          </p>
          <p className="text-xl font-bold text-gray-900">
            {totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-medium">
            New This Period
          </p>
          <p className="text-xl font-bold text-gray-900">
            {totalNew.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-medium">
            Growth Rate
          </p>
          <p
            className={cn(
              "text-xl font-bold",
              Number(growthRate) >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {Number(growthRate) >= 0 ? "+" : ""}
            {growthRate}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-[10px] text-gray-500 uppercase font-medium">
            Avg Daily
          </p>
          <p className="text-xl font-bold text-gray-900">{avgDaily}</p>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-500">
          No registration data available for this period
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value: string) =>
                  value === "newUsers" ? "New Signups" : "Total Users"
                }
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="newUsers"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="newUsers"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeUsers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="cumulativeUsers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {peakDay.newUsers > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Peak day:{" "}
          {new Date(peakDay.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          with {peakDay.newUsers} signups
        </p>
      )}
    </div>
  );
}
