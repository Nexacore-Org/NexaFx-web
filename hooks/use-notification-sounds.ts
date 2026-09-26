"use client";

import { useState, useCallback, useEffect } from "react";
import { sounds, toggleSounds, isSoundsEnabled } from "@/lib/utils/notification-sounds";

type SoundType = "success" | "notification" | "alert" | "error";

interface UseNotificationSoundsResult {
  isEnabled: boolean;
  toggle: (enabled: boolean) => void;
  playSound: (type: SoundType) => void;
}

export function useNotificationSounds(): UseNotificationSoundsResult {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(isSoundsEnabled());
  }, []);

  const toggle = useCallback((enabled: boolean) => {
    toggleSounds(enabled);
    setIsEnabled(enabled);
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!isEnabled) return;
      sounds[type]();
    },
    [isEnabled]
  );

  return { isEnabled, toggle, playSound };
}
