"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAttemptLimiter } from "@/hooks/use-attempt-limiter";
import { OTPInput } from "@/components/auth/otp-input";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
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
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
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
      router.replace("/dashboard");
    } catch {
      increment();
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
        <h1>Account Locked</h1>
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
      <h1>Verify Your Code</h1>
      <OTPInput
        maxDigits={6}
        onSubmit={handleSubmit}
        resendCount={3}
        onResend={handleResend}
        disabled={status === "verifying"}
      />
      {status === "error" && (
        <p role="alert" style={{ color: "red" }}>
          {message}
        </p>
      )}
      {status === "success" && <p>Verification successful!</p>}
    </div>
  );
}
