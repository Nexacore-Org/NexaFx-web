"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PoundSterling,
  Euro,
  Star,
} from "lucide-react";
import { InfoIcon } from "@/components/ui/info-icon";
import { useEffect, useRef, useState } from "react";
import { getExchangeRate } from "@/lib/api/exchange-rates";
import {
  addToWatchlist,
  getWatchlist,
  isInWatchlist,
  removeFromWatchlist,
} from "@/lib/utils/watchlist";

interface RateData {
  pair: string;
  rate: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  // Set when this pair's most recent fetch failed — the card shows a "Rates
  // temporarily unavailable" message instead of a stale/blank number.
  unavailable?: boolean;
  // Set when the last successful fetch for this pair is older than STALE_MS.
  stale?: boolean;
}

// A rate is considered stale once its last successful fetch is over 5 minutes old.
const STALE_MS = 5 * 60 * 1000;

const defaultPairs = [
  {
    to: "USD",
    from: "NGN",
    pair: "NGN/USD",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    to: "GBP",
    from: "NGN",
    pair: "NGN/GBP",
    icon: <PoundSterling className="w-4 h-4" />,
  },
  {
    to: "EUR",
    from: "NGN",
    pair: "NGN/EUR",
    icon: <Euro className="w-4 h-4" />,
  },
];

export function MarketOverview() {
  const [marketData, setMarketData] = useState<RateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  // Timestamp of the last successful fetch per pair, used to flag stale rates.
  const lastSuccessRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleStorageChange = () => {
      setWatchlist(getWatchlist());
    };

    setWatchlist(getWatchlist());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchRates = async () => {
    // Fetch every pair independently so a single failure (or a 500 from
    // GET /exchange-rates) only affects that card and never throws — the rest
    // of the dashboard keeps rendering.
    const results = await Promise.allSettled(
      defaultPairs.map((p) => getExchangeRate(p.from, p.to)),
    );

    const now = Date.now();
    const next: RateData[] = defaultPairs.map((p, index) => {
      const settled = results[index];

      if (settled.status === "fulfilled") {
        const res = settled.value;
        const rateValue = res?.data?.rate ?? res?.rate ?? 0;
        const changeValue =
          res?.data?.change ??
          res?.change ??
          res?.data?.percentChange ??
          res?.percentChange ??
          null;
        const isPositive =
          changeValue !== null ? parseFloat(changeValue) > 0 : null;

        lastSuccessRef.current[p.pair] = now;

        return {
          pair: p.pair,
          rate: rateValue
            ? `₦${Number(rateValue).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "N/A",
          change:
            changeValue !== null
              ? `${parseFloat(changeValue) >= 0 ? "+" : ""}${changeValue}%`
              : "N/A",
          up: isPositive ?? true,
          icon: p.icon,
          unavailable: false,
          stale: false,
        };
      }

      // This pair failed: show "Rates temporarily unavailable" rather than the
      // last good rate, and flag it stale once the last success is > 5 min old.
      const lastSuccess = lastSuccessRef.current[p.pair];
      return {
        pair: p.pair,
        rate: "",
        change: "",
        up: true,
        icon: p.icon,
        unavailable: true,
        stale: lastSuccess ? now - lastSuccess > STALE_MS : false,
      };
    });

    setMarketData(next);
    setLoading(false);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRates();
    }, 0);
    
    let interval: ReturnType<typeof setInterval>;
    
    const startPolling = () => {
      interval = setInterval(fetchRates, 60000);
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchRates();
        startPolling();
      }
    };
    
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const toggleWatchlist = (pair: string) => {
    if (isInWatchlist(pair)) {
      removeFromWatchlist(pair);
    } else {
      addToWatchlist(pair);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-lg font-semibold">
          Exchange Rates
          <InfoIcon tooltip="Live market rates from the Stellar decentralized exchange. Rates are updated every 60 seconds." />
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live updates{" "}
          {lastUpdated && (
            <span className="hidden md:inline">
              • Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      <div className="exchange-rates flex items-center overflow-x-auto gap-3 pb-2">
        {loading && marketData.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[251px] rounded-sm border-[0.43px] border-[#79797966] bg-card p-5 shadow-[4px-4px-12px-0px-#0000001A]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                </div>
                <div className="flex items-center justify-between gap-4 w-full">
                  <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-12 bg-muted animate-pulse rounded-full"></div>
                </div>
              </div>
            ))
          : marketData.map((item, index) => (
              <div
                key={index}
                className="min-w-[251px] rounded-sm border-[0.43px] border-[#79797966] bg-card p-5 hover:border-primary/50 transition-colors shadow-[4px-4px-12px-0px-#0000001A]"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.pair}
                  </p>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleWatchlist(item.pair)}
                      className="p-1 text-muted-foreground hover:text-yellow-400 transition-colors rounded-full -m-1 mr-1"
                      aria-label={
                        isInWatchlist(item.pair)
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                    >
                      <Star
                        className={`h-5 w-5 ${
                          isInWatchlist(item.pair) ? "text-yellow-400" : ""
                        }`}
                        fill={
                          isInWatchlist(item.pair) ? "currentColor" : "none"
                        }
                      />
                    </button>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                      {item.icon}
                    </div>
                  </div>
                </div>

                {item.unavailable ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Rates temporarily unavailable
                    </p>
                    {item.stale && (
                      <span className="inline-flex w-fit items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        Rates may be stale
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 w-full">
                    <p className="text-lg font-bold tracking-tight">
                      {item.rate}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.up
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {item.up ? (
                        <TrendingUp className="h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" />
                      )}
                      {item.change}
                    </div>
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
