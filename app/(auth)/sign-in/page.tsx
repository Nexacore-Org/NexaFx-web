"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/verify-otp");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#A0C3FD] to-[#FFE79C]">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="flex justify-between items-center px-8 py-6 backdrop-blur-sm bg-white/10">
          <Image src="/logo.png" alt="NexaFX" width={120} height={40} priority />
          <div className="text-sm text-gray-700">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#FFA200] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-center px-4 min-h-[calc(100vh-88px)]">
        <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-lg p-12 border border-border/50">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 text-center">Sign in</h1>
            <p className="text-muted-foreground text-sm text-center">Hey, Welcome back</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email address or Mobile number
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address or phone"
                title="Email address or mobile number"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm text-foreground"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  title="Password"
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm text-foreground"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link href="/forgot-password" className="text-xs text-[#926F03] hover:underline font-medium">
                  Forgotten password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#FFA200] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-lg p-8 border border-border/50">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <Image src="/logo.png" alt="NexaFX" width={120} height={40} priority />
            </div>

            <h1 className="text-2xl font-semibold text-center mb-2">Sign in</h1>
            <p className="text-muted-foreground text-center text-sm">
              Hey, welcome back{" "}
              <Link href="/verify-otp" className="text-[#FFA200] hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Email address
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              title="Email address"
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm text-foreground"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                title="Password"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm text-foreground"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <Link href="/forgot-password" className="text-xs text-[#926F03] hover:underline font-medium">
                Forgotten password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors disabled:opacity-50 text-sm mt-6"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#FFA200] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
