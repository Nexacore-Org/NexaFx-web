"use client";

import { useRef, useCallback, useEffect } from "react";

const SWIPE_THRESHOLD = 80;

interface SwipeToCloseOptions {
  onSwipe: () => void;
  direction?: "left" | "right";
  disabled?: boolean;
}

export function useSwipeToClose({
  onSwipe,
  direction = "left",
  disabled = false,
}: SwipeToCloseOptions) {
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    },
    [disabled],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      if (startX.current === 0) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX.current;
      const diffY = endY - startY.current;

      const isHorizontal = Math.abs(diffX) > Math.abs(diffY) * 1.5;

      if (!isHorizontal) {
        startX.current = 0;
        return;
      }

      const isRightSwipe = diffX > 0;
      const matchesDirection =
        (direction === "left" && !isRightSwipe && Math.abs(diffX) >= SWIPE_THRESHOLD) ||
        (direction === "right" && isRightSwipe && diffX >= SWIPE_THRESHOLD);

      if (matchesDirection) {
        onSwipe();
      }

      startX.current = 0;
    },
    [disabled, direction, onSwipe],
  );

  useEffect(() => {
    if (disabled) return;
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchEnd]);
}
