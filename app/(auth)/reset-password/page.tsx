"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  AuthShell,
  buttonClassName,
  inputClassName,
} from "@/components/auth/auth-shell";
import { apiClient } from "@/lib/api-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp: otp.trim(), password }),
      });
      router.push("/login?reset=success");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset your password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Enter the code from your email and a new secure password."
    >
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        {error ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <label className="block text-sm font-medium text-neutral-800">
          Reset code
          <input
            autoComplete="one-time-code"
            className={inputClassName}
            inputMode="numeric"
            onChange={(event) => setOtp(event.target.value)}
            value={otp}
          />
        </label>

        <label className="block text-sm font-medium text-neutral-800">
          New password
          <input
            autoComplete="new-password"
            className={inputClassName}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        <label className="block text-sm font-medium text-neutral-800">
          Confirm new password
          <input
            autoComplete="new-password"
            className={inputClassName}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
        </label>

        <button className={buttonClassName} disabled={isLoading} type="submit">
          {isLoading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
