"use client";

import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/lib/utils/clipboard";

export const useClipboard = (resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = async (text: string) => {
    const success = await copyToClipboard(text);

    if (!success) {
      return false;
    }

    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, resetDelay);

    return true;
  };

  return { copy, copied };
};
