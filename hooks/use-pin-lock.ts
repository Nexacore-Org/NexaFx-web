"use client";

import { useCallback, useEffect, useState } from "react";
import bcrypt from "bcryptjs";

const PIN_HASH_KEY = "nexafx_pin_hash";
const PIN_TIMEOUT_KEY = "nexafx_pin_timeout_ms";
const PIN_SETTINGS_EVENT = "nexafx-pin-settings-changed";
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const NEVER_TIMEOUT = 0;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

function getStoredTimeout() {
  if (typeof window === "undefined") return DEFAULT_TIMEOUT_MS;
  const stored = Number(localStorage.getItem(PIN_TIMEOUT_KEY));
  return Number.isFinite(stored) ? stored : DEFAULT_TIMEOUT_MS;
}

function getStoredHash() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PIN_HASH_KEY);
}

function isValidPin(pin: string) {
  return /^\d{4,6}$/.test(pin);
}

export function usePinLock() {
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [hasPin, setHasPin] = useState(() => Boolean(getStoredHash()));
  const [autoLockMs, setAutoLockMsState] = useState(getStoredTimeout);

  const refreshSettings = useCallback(() => {
    setHasPin(Boolean(getStoredHash()));
    setAutoLockMsState(getStoredTimeout());
  }, []);

  useEffect(() => {
    window.addEventListener(PIN_SETTINGS_EVENT, refreshSettings);
    window.addEventListener("storage", refreshSettings);
    return () => {
      window.removeEventListener(PIN_SETTINGS_EVENT, refreshSettings);
      window.removeEventListener("storage", refreshSettings);
    };
  }, [refreshSettings]);

  useEffect(() => {
    if (!hasPin || autoLockMs === NEVER_TIMEOUT) return;

    let lastActivity = Date.now();

    const markActivity = () => {
      if (!isPinLocked) {
        lastActivity = Date.now();
      }
    };

    const interval = window.setInterval(() => {
      if (!isPinLocked && Date.now() - lastActivity >= autoLockMs) {
        setIsPinLocked(true);
      }
    }, 1000);

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActivity, { passive: true }));

    return () => {
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActivity));
    };
  }, [autoLockMs, hasPin, isPinLocked]);

  const setupPin = useCallback(async (pin: string) => {
    if (!isValidPin(pin)) return false;
    const hash = await bcrypt.hash(pin, 10);
    localStorage.setItem(PIN_HASH_KEY, hash);
    window.dispatchEvent(new Event(PIN_SETTINGS_EVENT));
    setHasPin(true);
    setIsPinLocked(false);
    return true;
  }, []);

  const unlockWithPin = useCallback(async (pin: string) => {
    const hash = getStoredHash();
    if (!hash) return false;
    const matches = await bcrypt.compare(pin, hash);
    if (matches) setIsPinLocked(false);
    return matches;
  }, []);

  const changePin = useCallback(async (currentPin: string, nextPin: string) => {
    const currentMatches = await unlockWithPin(currentPin);
    if (!currentMatches || !isValidPin(nextPin)) return false;
    const hash = await bcrypt.hash(nextPin, 10);
    localStorage.setItem(PIN_HASH_KEY, hash);
    window.dispatchEvent(new Event(PIN_SETTINGS_EVENT));
    setHasPin(true);
    setIsPinLocked(false);
    return true;
  }, [unlockWithPin]);

  const disablePin = useCallback(async (pin: string) => {
    const hash = getStoredHash();
    if (!hash) return true;
    const matches = await bcrypt.compare(pin, hash);
    if (!matches) return false;
    localStorage.removeItem(PIN_HASH_KEY);
    window.dispatchEvent(new Event(PIN_SETTINGS_EVENT));
    setHasPin(false);
    setIsPinLocked(false);
    return true;
  }, []);

  const setAutoLockMs = useCallback((value: number) => {
    localStorage.setItem(PIN_TIMEOUT_KEY, String(value));
    window.dispatchEvent(new Event(PIN_SETTINGS_EVENT));
    setAutoLockMsState(value);
  }, []);

  const lockNow = useCallback(() => {
    if (getStoredHash()) setIsPinLocked(true);
  }, []);

  return {
    isPinLocked,
    unlockWithPin,
    setupPin,
    changePin,
    disablePin,
    hasPin,
    autoLockMs,
    setAutoLockMs,
    lockNow,
    refreshSettings,
  };
}
