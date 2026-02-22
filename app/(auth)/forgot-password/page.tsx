"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"form" | "confirmation">("form");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            await forgotPassword({ email });

            setStatus("confirmation");

            // Redirect after short delay
            setTimeout(() => {
                router.push(
                    `/reset-password?email=${encodeURIComponent(email)}`,
                );
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }

        {
            /*
            setTimeout(() => {
            setIsLoading(false);
            setStatus("confirmation");
        }, 1000);

        setTimeout(() => {
            setStatus("form");
            router.push("/reset-password");
        }, 3000);
    */
        }
    };

    const ConfirmationModal = () => (
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 sm:p-20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700 ">
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20 scale-150 duration-1000" />
                <CheckCircle2
                    size={120}
                    className="text-[#22C55E] relative z-10"
                    strokeWidth={1.5}
                />
            </div>

            <h1 className="sm:text-2xl md:text-3xl font-black text-zinc-900 tracking-tight mb-4 uppercase">
                Reset Code Sent
            </h1>

            <div className="space-y-6">
                <p className="text-zinc-500 sm:text-lg md:text-xl font-medium max-w-sm mx-auto">
                    Check your email for a reset code
                </p>
            </div>
        </div>
    );

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
                    <div className="text-sm text-gray-700">
                        <Link
                            href="/sign-in"
                            className="text-[#FFA200] hover:underline font-medium"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Desktop View */}

            <div
                className="hidden md:flex items-center justify-center px-4"
                style={{ minHeight: "calc(100vh - 88px)" }}
            >
                {status === "form" ? (
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-12 ">
                        <div className="mb-8">
                            <h1 className="text-3xl font-semibold mb-2 text-center">
                                Forgot password
                            </h1>
                            <p className="text-gray-500 text-sm text-center">
                                Please enter your email address and you we would
                                send you an OTP
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder=""
                                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
                            >
                                {isLoading ? "Sending" : "Send Reset Code"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <ConfirmationModal />
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex items-center justify-center min-h-screen px-4">
                {status === "form" ? (
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
                                Forgot password
                            </h1>
                            <p className="text-gray-500 text-center text-sm">
                                Please enter your email address and you we would
                                send you an OTP
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder=""
                                    className="w-full px-4 py-2.5 bg-[#F5F5F5] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 text-sm mt-6"
                            >
                                {isLoading ? "Sending..." : "Send Reset Code"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <ConfirmationModal />
                )}
            </div>
        </div>
    );
}
