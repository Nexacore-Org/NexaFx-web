"use client";

import { useState } from "react";
import { useAttemptLimiter } from "@/hooks/use-attempt-limiter";
import { OTPInput } from "@/components/auth/otp-input";

export default function VerifyPage() {
  const {
    failedAttempts,
    isLocked,
    timeRemaining,
    increment,
    reset,
    getDelay,
  } = useAttemptLimiter();
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (code: string) => {
    if (status === "verifying" || isLocked) return;
    setStatus("verifying");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const waitTime = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : getDelay(failedAttempts + 1);
        increment();
        setStatus("error");
        setMessage(
          `Too many failed attempts. Please wait ${Math.round(waitTime / 1000)}s before trying again.`,
        );
        return;
      }

      if (!res.ok) {
        increment();
        setStatus("error");
        setMessage("Invalid or expired code. Please try again.");
        return;
      }

      setStatus("success");
      reset();
    } catch {
      increment();
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      reset();
    } catch {
      // ignore
    }
  };

  if (isLocked) {
    return (
      <div>
        <h2>Account Locked</h2>
        <p>
          Too many failed attempts. Please wait{" "}
          <strong>{Math.round((timeRemaining ?? 0) / 1000)}</strong>s before
          trying again.
        </p>
        <OTPInput maxDigits={6} onSubmit={() => {}} disabled />
      </div>
    );
  }

  return (
    <div>
      <h2>Verify Your Code</h2>
      <OTPInput
        maxDigits={6}
        onSubmit={handleSubmit}
        resendCount={3}
        onResend={handleResend}
        disabled={status === "verifying"}
      />
      {status === "error" && <p style={{ color: "red" }}>{message}</p>}
      {status === "success" && <p>Verification successful!</p>}
    </div>
  );
}
