"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";

const SIGNUP_SUCCESS_KEY = "signup-success-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const successMessage = sessionStorage.getItem(SIGNUP_SUCCESS_KEY);
    if (!successMessage) return;

    setToast(successMessage);
    sessionStorage.removeItem(SIGNUP_SUCCESS_KEY);

    const timeout = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      sessionStorage.setItem("login-email", email);
      router.push("/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#A0C3FD] to-[#FFE79C]">
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 w-[min(92vw,32rem)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg animate-in fade-in slide-in-from-top-3">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 text-card-foreground shadow-lg sm:p-12">
          <div className="mb-8">
            <div className="mb-6 flex justify-center">
              <Image src="/logo.png" alt="NexaFX" width={120} height={40} priority />
            </div>
            <h1 className="mb-2 text-center text-3xl font-semibold">Sign in</h1>
            <p className="text-center text-sm text-muted-foreground">
              Hey, welcome back
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email address or Mobile number
              </label>
              <input
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email address or phone"
                className="w-full rounded-md border border-border bg-muted px-4 py-2.5 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-[#F39A00]"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-md border border-border bg-muted px-4 py-2.5 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-[#F39A00]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#926F03] hover:underline"
                >
                  Forgotten password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-md bg-[#F39A00] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#da8a00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#FFA200] hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
