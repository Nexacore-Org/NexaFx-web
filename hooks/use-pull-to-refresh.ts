"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const THRESHOLD = 80;
const MAX_PULL = 120;

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

interface PullToRefreshState {
  pullDistance: number;
  isRefreshing: boolean;
  isReleasing: boolean;
}

export function usePullToRefresh({
  onRefresh,
  disabled = false,
}: PullToRefreshOptions): PullToRefreshState {
  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    isRefreshing: false,
    isReleasing: false,
  });
  const startY = useRef(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || state.isRefreshing) return;
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
    },
    [disabled, state.isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || state.isRefreshing || state.isReleasing) return;
      if (startY.current === 0) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff <= 0 || window.scrollY > 0) {
        startY.current = 0;
        setState((prev) => ({ ...prev, pullDistance: 0 }));
        return;
      }

      const dampened = Math.min(diff * 0.5, MAX_PULL);
      setState((prev) => ({ ...prev, pullDistance: dampened }));
    },
    [disabled, state.isRefreshing, state.isReleasing],
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || state.isRefreshing || state.isReleasing) return;
    if (state.pullDistance >= THRESHOLD) {
      setState({ pullDistance: THRESHOLD, isRefreshing: true, isReleasing: true });
      try {
        await onRefresh();
      } finally {
        setState({ pullDistance: 0, isRefreshing: false, isReleasing: false });
      }
    } else {
      setState((prev) => ({ ...prev, pullDistance: 0 }));
    }
    startY.current = 0;
  }, [disabled, state.isRefreshing, state.isReleasing, state.pullDistance, onRefresh]);

  useEffect(() => {
    if (disabled) return;
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return state;
}
