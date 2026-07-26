"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

type Props = {
  unlockWithPin: (pin: string) => Promise<boolean>;
};

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function PinLockScreen({ unlockWithPin }: Props) {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const isLockedOut = remainingSeconds > 0;

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setAttempts(0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [remainingSeconds]);

  const submitPin = async (value: string) => {
    const matches = await unlockWithPin(value);
    if (matches) {
      setPin("");
      setError("");
      setAttempts(0);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setPin("");
    if (nextAttempts >= 5) {
      setRemainingSeconds(30);
      setError("Too many incorrect attempts. Try again in 30 seconds.");
    } else {
      setError("Incorrect PIN. Try again.");
    }
  };

  const handleDigit = async (digit: string) => {
    if (isLockedOut || pin.length >= 6) return;
    const nextPin = `${pin}${digit}`;
    setPin(nextPin);
    setError("");
    if (nextPin.length >= 4) {
      await submitPin(nextPin);
    }
  };

  const handleBackspace = () => {
    if (isLockedOut) return;
    setPin((current) => current.slice(0, -1));
  };

  const handleForgotPin = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <LockKeyhole className="h-7 w-7 text-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">NexaFx Locked</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your app PIN to continue.</p>

        <div className="mt-8 flex justify-center gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-full border ${index < pin.length ? "border-foreground bg-foreground" : "border-border"}`}
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {keys.slice(0, 9).map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              disabled={isLockedOut}
              className="h-14 rounded-xl border border-border text-xl font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isLockedOut}
            className="h-14 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            disabled={isLockedOut}
            className="h-14 rounded-xl border border-border text-xl font-semibold text-foreground hover:bg-muted disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => pin.length >= 4 && submitPin(pin)}
            disabled={isLockedOut || pin.length < 4}
            className="h-14 rounded-xl bg-foreground text-sm font-semibold text-background disabled:opacity-50"
          >
            Unlock
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {isLockedOut ? `Try again in ${remainingSeconds}s.` : error}
          </p>
        )}

        <button
          type="button"
          onClick={handleForgotPin}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Forgot PIN? Sign out
        </button>
      </div>
    </div>
  );
}
