"use client";

import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const { isPulling, pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh({ onRefresh, threshold });

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: isRefreshing ? 48 : Math.min(pullDistance, 80) }}
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full border-4 border-primary",
              isRefreshing ? "border-t-transparent animate-spin" : "border-t-transparent",
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${(pullDistance / threshold) * 360}deg)`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
