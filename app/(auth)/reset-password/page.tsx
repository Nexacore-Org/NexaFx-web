"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { resetPassword } from "@/lib/api/auth";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations/auth";
import { Input } from "@/components/ui/Input";

const EyeIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // Digit array kept for the multi-input OTP UX; joined value is synced into RHF
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateOtp = (updated: string[]) => {
    setDigits(updated);
    setValue("otp", updated.join(""), { shouldValidate: true });
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value.slice(-1);
    updateOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const updated = [...digits];
    pasted.split("").forEach((char, i) => { if (i < 6) updated[i] = char; });
    updateOtp(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!email) {
      setApiError("Session expired. Please start again.");
      return;
    }
    setApiError("");
    setIsLoading(true);
    try {
      await resetPassword({ email, otp: data.otp, password: data.newPassword });
      router.push("/sign-in?reset=success");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Hidden field wires the joined OTP string into RHF for zodResolver validation
  const { ref: otpRef, ...otpRest } = register("otp");

  return (
    <div className="min-h-screen bg-linear-to-br from-[#A0C3FD] to-[#FFE79C]">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/10">
          <Image src="/logo.png" alt="NexaFX" width={120} height={40} priority />
        </div>
      </div>

      <div className="flex items-center justify-center px-4 min-h-screen md:min-h-[calc(100vh-88px)]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Logo shown only on mobile */}
          <div className="flex justify-center mb-6 md:hidden">
            <Image src="/logo.png" alt="NexaFX" width={120} height={40} priority />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
              Reset Password
            </h1>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden input wires the OTP joined value into RHF */}
            <input type="hidden" ref={otpRef} {...otpRest} />

            <div>
              <div className="flex gap-1 md:gap-2.5 justify-between">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 md:w-12 h-11 md:h-12 text-center text-lg md:text-xl font-semibold bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-1.5 ml-1 text-xs text-red-500">{errors.otp.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Input
                  {...register("newPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  disabled={isLoading}
                  error={errors.newPassword?.message}
                  className="bg-[#F5F5F5] border-0 focus:ring-[#F39A00] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  disabled={isLoading}
                  error={errors.confirmPassword?.message}
                  className="bg-[#F5F5F5] border-0 focus:ring-[#F39A00] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
