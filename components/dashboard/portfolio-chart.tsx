"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getBalances } from "@/lib/api/wallet";
import { getExchangeRates } from "@/lib/api/exchange-rates";
import {
  calculatePortfolioAllocation,
  type PortfolioAllocation,
} from "@/lib/utils/portfolio";
import { formatCurrency } from "@/lib/utils/format";

const COLOR_MAP: Record<string, string> = {
  NGN: "#22c55e",
  USD: "#3b82f6",
  EUR: "#a855f7",
};

const DEFAULT_COLOR = "#6b7280";

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: PortfolioAllocation }[];
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm">
      <p className="font-semibold">{data.currency}</p>
      <p>Amount: {data.amount.toLocaleString()}</p>
      <p>NGN Value: {formatCurrency(data.ngnEquivalent, "NGN")}</p>
      <p>Allocation: {data.percentage.toFixed(1)}%</p>
    </div>
  );
}

export function PortfolioChart() {
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [balances, ratesData] = await Promise.all([
          getBalances(),
          getExchangeRates(),
        ]);

        if (cancelled) return;

        const parsedBalances = balances.map((b) => ({
          currency: b.currency,
          balance: Number(b.balance) || 0,
        }));

        const rates = ratesData?.data?.rates ?? ratesData?.rates ?? {};

        const result = calculatePortfolioAllocation(parsedBalances, rates);
        setAllocations(result);
      } catch (err) {
        console.error("Failed to load portfolio data", err);
        setError("Failed to load portfolio data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="flex justify-center">
            <div className="h-48 w-48 rounded-full bg-muted" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-full bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No portfolio data available.</p>
      </div>
    );
  }

  const totalNgn = allocations.reduce((sum, a) => sum + a.ngnEquivalent, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-semibold">Portfolio Allocation</h3>
      <div className="flex flex-col items-center">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={allocations}
                dataKey="ngnEquivalent"
                nameKey="currency"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {allocations.map((entry) => (
                  <Cell
                    key={entry.currency}
                    fill={COLOR_MAP[entry.currency] || DEFAULT_COLOR}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-bold">
                {formatCurrency(totalNgn, "NGN")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 w-full space-y-2">
          {allocations.map((item) => (
            <div
              key={item.currency}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      COLOR_MAP[item.currency] || DEFAULT_COLOR,
                  }}
                />
                <span className="font-medium">{item.currency}</span>
                <span className="text-muted-foreground">
                  {item.amount.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
