"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getTransactions } from "@/lib/api/transactions";
import { getConversionSummary, type ConversionSummary } from "@/lib/api/transactions";

interface ChartData {
  period: string;
  [key: string]: string | number;
}

export function ConversionChart() {
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string>("all");
  const [summary, setSummary] = useState<ConversionSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getTransactions({ limit: 1000 });
        const data = getConversionSummary(res.data);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversion history");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pairs = Array.from(new Set(summary.map(s => `${s.fromCurrency} → ${s.toCurrency}`)));

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }).reverse();

  const chartData: ChartData[] = last6Months.map(period => {
    const row: ChartData = { period };
    pairs.forEach(pair => {
      row[pair] = 0;
    });
    summary
      .filter(s => s.period === period)
      .forEach(s => {
        const key = `${s.fromCurrency} → ${s.toCurrency}`;
        if (selectedPair === "all" || key === selectedPair) {
          row[key] = (row[key] as number || 0) + s.totalAmount;
        }
      });
    return row;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const hasData = summary.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Conversion History</h3>
        {pairs.length > 0 && (
          <select
            value={selectedPair}
            onChange={e => setSelectedPair(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Pairs</option>
            {pairs.map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
        )}
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No conversions yet
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {selectedPair === "all"
                ? pairs.map(pair => (
                    <Bar
                      key={pair}
                      dataKey={pair}
                      name={pair}
                      fill={`hsl(${pairs.indexOf(pair) * 60}, 60%, 55%)`}
                    />
                  ))
                : (
                    <Bar dataKey={selectedPair} name={selectedPair} fill="#eab308" />
                  )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
