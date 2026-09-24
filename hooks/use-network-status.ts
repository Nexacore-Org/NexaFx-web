"use client";

import { useEffect, useRef, useState } from "react";

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") {
      return true;
    }

    return navigator.onLine;
  });
  const [wasOffline, setWasOffline] = useState(false);
  const hasBeenOfflineRef = useRef(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const handleOffline = () => {
      hasBeenOfflineRef.current = true;
      setIsOnline(false);
      setWasOffline(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(hasBeenOfflineRef.current);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
