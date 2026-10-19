"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RatePoint } from "@/lib/api/rates";

const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/**
 * The only module that imports recharts. It is loaded through next/dynamic
 * from rate-history-chart.tsx so the library stays out of the initial
 * Convert bundle.
 */
export default function RateChartCanvas({ points }: { points: RatePoint[] }) {
  const data = points.map((point) => ({
    time: Date.parse(point.timestamp),
    rate: point.rate,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(value: number) => dayFormat.format(value)}
          minTickGap={24}
        />
        <YAxis domain={["auto", "auto"]} width={64} />
        <Tooltip labelFormatter={(value) => dayFormat.format(Number(value))} />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="currentColor"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
