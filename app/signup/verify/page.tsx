"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifySignupOtp, resendSignupOtp } from "@/lib/api/auth";
import OtpInput from "@/components/auth/otp-input";
import { useOtpVerifyBackoff } from "@/hooks/use-otp-verify-backoff";

const COOLDOWN_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const {
    isBlocked: isBackoffBlocked,
    secondsRemaining: backoffSeconds,
    failedAttempts,
    registerFailure: registerFailedAttempt,
    reset: resetBackoff,
  } = useOtpVerifyBackoff("signup-otp-verify-backoff");

  useEffect(() => {
    const stored = sessionStorage.getItem("signup_email");
    if (stored) setEmail(stored);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (isBackoffBlocked) return;
    if (otp.length !== 6) return;

    setIsLoading(true);
    setApiError("");
    try {
      await verifySignupOtp({ email, otp });
      resetBackoff();
      router.push("/signup/success");
    } catch (err) {
      registerFailedAttempt();
      setApiError(
        err instanceof Error ? err.message : "Invalid or expired OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setApiError("");
    setResendMessage("");
    try {
      await resendSignupOtp({ email });
      setResendMessage("Code resent successfully");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (
        message.toLowerCase().includes("rate") ||
        message.toLowerCase().includes("too many")
      ) {
        setApiError("Too many requests. Please wait before trying again.");
        setCooldown(COOLDOWN_SECONDS);
      } else {
        setApiError(message || "Failed to resend code");
      }
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.length === 6;

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
          VERIFY CODE
        </h1>
        <p className="text-zinc-500 max-w-[280px] mx-auto leading-relaxed italic">
          Confirmation code sent. Check inbox or spam folder for the code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <OtpInput value={otp} onChange={(val) => setOtp(val)} />

        {apiError && (
          <p className="text-xs text-red-500 text-center">{apiError}</p>
        )}
        {resendMessage && (
          <p className="text-xs text-green-600 text-center">{resendMessage}</p>
        )}
        {isBackoffBlocked && (
          <p role="status" className="text-center text-xs text-amber-600">
            {failedAttempts} failed attempts. Please wait {backoffSeconds}s
            before trying again.
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !isOtpComplete || isBackoffBlocked}
          className="w-full h-16 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-[0_4px_14px_0_rgb(249,115,22,0.39)] transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : isBackoffBlocked ? (
            `Wait ${backoffSeconds}s`
          ) : (
            "Proceed"
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="text-sm font-medium text-zinc-500 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : isResending
                ? "Resending..."
                : "Didn't receive code? Resend"}
          </button>
        </div>
      </form>
    </div>
  );
}
