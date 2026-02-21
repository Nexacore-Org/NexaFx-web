"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifySignupOtp, resendSignupOtp } from "@/lib/api/auth";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const stored = sessionStorage.getItem("signup_email");
    if (stored) setEmail(stored);
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);

    // Auto-advance
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) return;

    setIsLoading(true);
    setApiError("");
    try {
      await verifySignupOtp({ email, otp: otp.join("") });
      router.push("/signup/success");
    } catch (err) {
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
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

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
        <div className="flex justify-between gap-2 sm:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-full aspect-square text-center text-2xl font-bold border-2 border-zinc-100 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-zinc-900 bg-zinc-50/50"
            />
          ))}
        </div>

        {apiError && (
          <p className="text-xs text-red-500 text-center">{apiError}</p>
        )}
        {resendMessage && (
          <p className="text-xs text-green-600 text-center">{resendMessage}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !isOtpComplete}
          className="w-full h-16 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-[0_4px_14px_0_rgb(249,115,22,0.39)] transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
            disabled={isResending}
            className="text-sm font-medium text-zinc-500 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Resending..." : "Didn't receive code? Resend"}
          </button>
        </div>
      </form>
    </div>
  );
}
