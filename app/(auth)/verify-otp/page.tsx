"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  AuthShell,
  buttonClassName,
  inputClassName,
} from "@/components/auth/auth-shell";
import { useAuthStore, type AuthUser } from "@/hooks/use-auth-store";
import { apiClient } from "@/lib/api-client";

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface WrappedAuthResponse {
  data: AuthResponse;
}

function unwrapAuthResponse(response: AuthResponse | WrappedAuthResponse) {
  return "data" in response ? response.data : response;
}

function subscribeToLoginEmail() {
  return () => undefined;
}

function getLoginEmail() {
  return typeof window === "undefined"
    ? ""
    : sessionStorage.getItem("login-email") ?? "";
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const email = useSyncExternalStore(
    subscribeToLoginEmail,
    getLoginEmail,
    () => "",
  );
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Your login session has expired. Please sign in again.");
      return;
    }

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient<AuthResponse | WrappedAuthResponse>(
        "/auth/verify-login-otp",
        {
          method: "POST",
          body: JSON.stringify({ email, otp: otp.trim() }),
        },
      );
      const auth = unwrapAuthResponse(response);
      setAuth(auth.user, auth.accessToken, auth.refreshToken);
      router.push("/dashboard");
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : "Invalid OTP",
      );
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendMessage("");
    setIsResending(true);

    try {
      await apiClient("/auth/resend-signup-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResendMessage("A new code has been sent.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to resend the code.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your sign-in"
      subtitle={
        email
          ? `Enter the six-digit code sent to ${email}.`
          : "Enter the six-digit code sent to your email."
      }
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {error ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {resendMessage ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {resendMessage}
          </p>
        ) : null}

        <label className="block text-sm font-medium text-neutral-800">
          One-time password
          <input
            autoComplete="one-time-code"
            className={`${inputClassName} text-center text-xl tracking-[0.55em]`}
            disabled={isLoading}
            inputMode="numeric"
            maxLength={6}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            value={otp}
          />
        </label>

        <button className={buttonClassName} disabled={isLoading} type="submit">
          {isLoading ? "Verifying..." : "Verify code"}
        </button>
        <button
          className="w-full text-sm font-semibold text-neutral-700 underline disabled:opacity-60"
          disabled={isResending || !email}
          onClick={handleResend}
          type="button"
        >
          {isResending ? "Resending..." : "Resend code"}
        </button>
      </form>
    </AuthShell>
  );
}
