"use client";

import { useState, useEffect } from "react";
import { Star, Plus, X, Loader2 } from "lucide-react";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/lib/utils/watchlist";
import { apiClient } from "@/lib/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ALL_PAIRS = ["NGN/USD", "NGN/EUR", "NGN/GBP", "NGN/CAD", "NGN/AUD"];

interface Rate {
  pair: string;
  rate: number;
  change?: number;
}

export function Watchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    setLoading(true);
    const currentWatchlist = getWatchlist();
    if (currentWatchlist.length === 0) {
      setRates([]);
      setLoading(false);
      return;
    }

    try {
      const promises = currentWatchlist.map(async (pair) => {
        const [base, quote] = pair.split("/");
        const response = await apiClient.get(`/exchange-rates?base=${quote}`);
        return { pair, rate: response.data.rates[base] };
      });
      const newRates = await Promise.all(promises);
      setRates(newRates);
    } catch (error) {
      console.error("Failed to fetch rates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setWatchlist(getWatchlist());
    };

    setWatchlist(getWatchlist());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [watchlist]);

  if (watchlist.length === 0) {
    return null; // Hidden entirely if the watchlist is empty
  }

  const availablePairs = ALL_PAIRS.filter((p) => !isInWatchlist(p));

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Star className="text-yellow-400" />
          My Watchlist
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Pair
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availablePairs.length > 0 ? (
              availablePairs.map((pair) => (
                <DropdownMenuItem
                  key={pair}
                  onClick={() => addToWatchlist(pair)}
                >
                  {pair}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>All pairs added</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rates.map(({ pair, rate, change }) => (
            <div
              key={pair}
              className="bg-muted/50 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-sm">
                  {pair.replace("/", " / ")}
                </p>
                <p className="text-lg font-mono">
                  {rate ? rate.toFixed(2) : "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {change && (
                  <p
                    className={`text-sm font-medium ${change >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFromWatchlist(pair)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No pairs saved. Add a currency pair to your watchlist.</p>
        </div>
      )}
    </div>
  );
}
