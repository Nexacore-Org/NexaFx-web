"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Notification } from "@/types/notification";
import { NotificationItem } from "./notification-item";
import { cn } from "@/lib/utils";

interface SwipeableNotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  onDelete?: () => void;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableNotificationItem({
  notification,
  onClick,
  onDelete,
}: SwipeableNotificationItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;

    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      // Trigger delete animation
      setIsDeleting(true);
      const direction = translateX > 0 ? 1 : -1;
      setTranslateX(direction * 400);

      // Call onDelete after animation
      setTimeout(() => {
        onDelete?.();
      }, 200);
    } else {
      // Snap back
      setTranslateX(0);
    }
  };

  const progress = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);

  return (
    <div className="relative overflow-hidden">
      {/* Delete background indicator */}
      <div
        className={cn(
          "absolute inset-0 flex items-center px-6",
          translateX > 0 ? "justify-start" : "justify-end",
          "bg-red-500"
        )}
        style={{ opacity: progress }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      {/* Swipeable content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging.current ? "none" : "transform 0.2s ease-out",
        }}
        className={cn(
          "relative bg-card touch-pan-y",
          isDeleting && "opacity-0 transition-opacity duration-200"
        )}
      >
        <NotificationItem notification={notification} onClick={onClick} />
      </div>
    </div>
  );
}
