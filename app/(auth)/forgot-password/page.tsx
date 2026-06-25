"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AuthShell,
  buttonClassName,
  inputClassName,
} from "@/components/auth/auth-shell";
import { apiClient } from "@/lib/api-client";

const SUCCESS_MESSAGE =
  "If an account exists for that email, we sent password reset instructions.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // The response is intentionally identical to avoid exposing account existence.
    } finally {
      setIsSubmitted(true);
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will send the next steps."
      footer={
        <Link className="font-semibold text-neutral-950 underline" href="/login">
          Back to sign in
        </Link>
      }
    >
      {isSubmitted ? (
        <div
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800"
          role="status"
        >
          {SUCCESS_MESSAGE}
        </div>
      ) : (
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-neutral-800">
            Email
            <input
              autoComplete="email"
              className={inputClassName}
              disabled={isLoading}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <button className={buttonClassName} disabled={isLoading} type="submit">
            {isLoading ? "Sending..." : "Send reset instructions"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
