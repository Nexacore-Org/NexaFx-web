"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const updatedOtp = [...otp];
        updatedOtp[index] = value.slice(-1);
        setOtp(updatedOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const updatedOtp = [...otp];
        pastedData.split("").forEach((char, index) => {
            if (index < 6) updatedOtp[index] = char;
        });
        setOtp(updatedOtp);
        const lastFilledIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastFilledIndex]?.focus();
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
            newErrors.otp = "Please enter all 6 digits";
        }

        if (!newPassword) newErrors.newPassword = "Password is required";
        else if (newPassword.length < 8)
            newErrors.newPassword = "Password must be at least 8 characters";

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (!email) {
            setApiError("Session expired. Please start again.");
            return;
        }

        const otpCode = otp.join("");

        setIsLoading(true);
        setApiError("");

        try {
            await resetPassword({
                email,
                otp: otpCode,
                newPassword,
            });

            router.push("/sign-in?reset=success");
        } catch (err) {
            setApiError(
                err instanceof Error ? err.message : "Invalid or expired OTP",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#A0C3FD] to-[#FFE79C]">
            {/* Desktop Header */}
            <div className="hidden md:block">
                <div className="flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/10">
                    <Image
                        src="/logo.png"
                        alt="NexaFX"
                        width={120}
                        height={40}
                        priority
                    />
                </div>
            </div>

            {/* Desktop View */}
            <div
                className="hidden md:flex items-center justify-center px-4"
                style={{ minHeight: "calc(100vh - 88px)" }}
            >
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold mb-2 text-center">
                            Reset Password
                        </h1>
                    </div>

                    {apiError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2.5 justify-between">
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
                                    onChange={(e) =>
                                        handleChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-xl font-semibold bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all"
                                    disabled={isLoading}
                                />
                            ))}
                            {errors.otp && (
                                <p className="mt-1.5 ml-1 text-xs text-red-500">
                                    {errors.otp}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                New Password
                            </label>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder=""
                                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm"
                                    disabled={isLoading}
                                />
                                {errors.newPassword && (
                                    <p className="mt-1.5 ml-1 text-xs text-red-500">
                                        {errors.newPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder=""
                                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm"
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1.5 ml-1 text-xs text-red-500">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg
                                            width="18"
                                            height="18"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="18"
                                            height="18"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
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

            {/* Mobile View */}
            <div className="md:hidden flex items-center justify-center min-h-screen px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <div className="mb-8">
                        <div className="flex justify-center mb-6">
                            <Image
                                src="/logo.png"
                                alt="NexaFX"
                                width={120}
                                height={40}
                                priority
                            />
                        </div>

                        <h1 className="text-2xl font-semibold text-center mb-2">
                            Reset Password
                        </h1>
                    </div>

                    {apiError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-1 justify-between">
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
                                    onChange={(e) =>
                                        handleChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-10 h-11 text-center text-lg font-semibold bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all"
                                    disabled={isLoading}
                                />
                            ))}
                            {errors.otp && (
                                <p className="mt-1.5 ml-1 text-xs text-red-500">
                                    {errors.otp}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                New Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder=""
                                className="w-full px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm"
                                disabled={isLoading}
                            />
                            {errors.newPassword && (
                                <p className="mt-1.5 ml-1 text-xs text-red-500">
                                    {errors.newPassword}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder=""
                                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm"
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-1.5 ml-1 text-xs text-red-500">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? (
                                        <svg
                                            width="18"
                                            height="18"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="18"
                                            height="18"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 text-sm mt-6"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
