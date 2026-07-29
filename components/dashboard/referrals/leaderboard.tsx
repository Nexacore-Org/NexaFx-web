"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReferralLeaderboard, type LeaderboardEntry } from "@/lib/api/referrals";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export function ReferralLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    let cancelled = false;
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await getReferralLeaderboard();
        if (!cancelled) setEntries(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load leaderboard");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const currentUserRank = currentUserEntry?.rank;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          No referral data yet. Be the first to refer!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">
        This month&apos;s top referrers
      </h3>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Referrals
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                Rewards Earned
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.slice(0, 10).map((entry) => (
              <tr
                key={entry.rank}
                className={cn(
                  "hover:bg-muted/50 transition-colors",
                  entry.isCurrentUser && "bg-primary/5"
                )}
              >
                <td className="px-4 py-3">
                  <span className={cn("font-bold", getMedalColor(entry.rank))}>
                    {entry.rank <= 3 ? (
                      <Trophy className="inline h-4 w-4 mr-1" />
                    ) : null}
                    #{entry.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-foreground">{entry.maskedEmail}</span>
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground font-medium">
                  {entry.referralCount}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {entry.totalRewardEarned.toLocaleString()}{" "}
                  {entry.rewardCurrency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {entries.slice(0, 10).map((entry) => (
          <div
            key={entry.rank}
            className={cn(
              "p-3 rounded-lg border border-border",
              entry.isCurrentUser && "bg-primary/5 border-primary/20"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("font-bold text-sm", getMedalColor(entry.rank))}>
                  {entry.rank <= 3 ? (
                    <Trophy className="inline h-3 w-3 mr-0.5" />
                  ) : null}
                  #{entry.rank}
                </span>
                <span className="text-sm text-foreground">{entry.maskedEmail}</span>
                {entry.isCurrentUser && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                    You
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {entry.referralCount} referrals
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.totalRewardEarned.toLocaleString()} {entry.rewardCurrency}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentUserRank && currentUserRank > 10 && (
        <p className="text-sm text-muted-foreground text-center">
          Your rank: <span className="font-bold text-foreground">#{currentUserRank}</span>
        </p>
      )}
    </div>
  );
}
