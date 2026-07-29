"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/auth/otp-input";
import { resendLoginOtp, verifyLoginOtp } from "@/lib/api/auth";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function VerifyOtpPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("login-email");
    if (!storedEmail) {
      router.replace("/login");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError("");
    setResendMessage("");

    if (!email) {
      setApiError("Please sign in again to continue.");
      return;
    }

    if (otp.length !== 6) {
      setApiError("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = (await verifyLoginOtp({
        email,
        otp,
      })) as {
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          role: "USER" | "ADMIN";
        };
        accessToken: string;
        refreshToken: string;
      };

      if (!res?.accessToken || !res?.refreshToken || !res?.user) {
        setApiError("Login completed, but no session tokens were returned.");
        return;
      }

      setAuth(
        {
          id: res.user.id,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          name: `${res.user.firstName} ${res.user.lastName}`.trim(),
          email: res.user.email,
          role: res.user.role,
        },
        res.accessToken,
        res.refreshToken,
      );
      sessionStorage.removeItem("login-email");
      router.push("/");
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
    setResendMessage("");

    try {
      await resendLoginOtp({ email });
      setResendMessage("A new code has been sent.");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Failed to resend code",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-border/50 bg-card p-8 text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-5 duration-500 sm:p-12">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900">
          Verify code
        </h1>
        <p className="mx-auto max-w-[280px] leading-relaxed text-zinc-500 italic">
          Confirmation code sent. Check your inbox or spam folder.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <OtpInput value={otp} onChange={setOtp} />

        {apiError && (
          <p className="text-center text-xs text-red-500">{apiError}</p>
        )}
        {resendMessage && (
          <p className="text-center text-xs text-green-600">{resendMessage}</p>
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
            "Proceed"
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email}
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Didn't receive code? Resend"}
          </button>
        </div>
      </form>
    </div>
  );
}