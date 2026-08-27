"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/auth/otp-input";
import { resendSignupOtp, verifySignupOtp } from "@/lib/api/auth";

const SUCCESS_TOAST_KEY = "signup-success-toast";
const EMAIL_KEYS = ["signup-email", "signup_email"];

export default function SignupVerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedEmail =
      EMAIL_KEYS.map((key) => sessionStorage.getItem(key)).find(Boolean) || "";

    if (!storedEmail) {
      router.replace("/signup");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError("");
    setMessage("");

    if (!email) {
      setApiError("Please start the signup process again.");
      return;
    }

    if (otp.length !== 6) {
      setApiError("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      await verifySignupOtp({ email, otp });
      EMAIL_KEYS.forEach((key) => sessionStorage.removeItem(key));
      sessionStorage.setItem(
        SUCCESS_TOAST_KEY,
        "Account verified — please log in",
      );
      router.replace("/login");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Invalid or expired OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setApiError("");
    setMessage("");

    try {
      await resendSignupOtp({ email });
      setMessage("A new OTP has been sent to your email address.");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Failed to resend OTP",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-border/50 bg-card p-8 text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-5 duration-500 sm:p-12">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900">
          Verify your email
        </h1>
        <p className="mx-auto max-w-sm leading-relaxed text-zinc-500">
          We sent a 6-digit code to your email. Enter it below to activate your
          account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <OtpInput value={otp} onChange={setOtp} />

        {apiError && (
          <p className="text-center text-xs text-red-500">{apiError}</p>
        )}
        {message && (
          <p className="text-center text-xs text-green-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="h-16 w-full rounded-xl bg-orange-500 text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(249,115,22,0.39)] transition-all hover:scale-[1.01] hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify OTP"
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email}
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Didn't receive a code? Resend"}
          </button>
        </div>
      </form>
    </div>
  );
}
