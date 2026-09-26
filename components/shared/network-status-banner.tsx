"use client";

import { CheckCircle2, WifiOff } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";

export function NetworkStatusBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <BannerFrame tone="offline" icon={WifiOff}>
        You&apos;re offline. Please check your connection.
      </BannerFrame>
    );
  }

  if (wasOffline) {
    return <BackOnlineBanner />;
  }

  return null;
}

function BackOnlineBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <BannerFrame tone="online" icon={CheckCircle2}>
      Back online!
    </BannerFrame>
  );
}

function BannerFrame({
  children,
  icon: Icon,
  tone,
}: {
  children: ReactNode;
  icon: typeof WifiOff;
  tone: "offline" | "online";
}) {
  return (
    <div
      className="sticky top-0 z-50 px-4 pt-4 md:px-8"
      aria-live="polite"
      role="status"
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm backdrop-blur-sm",
          tone === "offline"
            ? "border-amber-300 bg-amber-100 text-amber-900"
            : "border-emerald-300 bg-emerald-100 text-emerald-900",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{children}</p>
      </div>
    </div>
  );
}
