"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { mockRevenueData } from "@/lib/admin-mock-data";

const ACTIVE_MONTH = "MAY";
const ACTIVE_COLOR = "#F97316";
const DEFAULT_COLOR = "#E5E7EB";

const yAxisTicks = [0, 10000, 30000, 50000, 100000];

function formatYAxis(value: number) {
    if (value === 0) return "$0K";
    return `$${value / 1000}K`;
}

export function RevenueChart() {
    return (
        <div className="bg-white rounded-2xl flex-1 min-w-0 h-63.25 py-2.5 px-5 border border-gray-200 flex flex-col gap-2">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <h3 className="text-base font-semibold text-gray-900">Revenue</h3>
                <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                    This month
                    <ChevronDown size={14} />
                </button>
            </div>

            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={mockRevenueData}
                        barSize={35}
                        barCategoryGap="20%"
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#9CA3AF" }}
                            dy={6}
                        />
                        <YAxis
                            ticks={yAxisTicks}
                            tickFormatter={formatYAxis}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#9CA3AF" }}
                            width={44}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            formatter={(value: number | undefined) => [
                                `$${(value ?? 0).toLocaleString()}`,
                                "Revenue",
                            ]}
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                fontSize: "12px",
                            }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {mockRevenueData.map((entry) => (
                                <Cell
                                    key={entry.month}
                                    fill={
                                        entry.month === ACTIVE_MONTH
                                            ? ACTIVE_COLOR
                                            : DEFAULT_COLOR
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
