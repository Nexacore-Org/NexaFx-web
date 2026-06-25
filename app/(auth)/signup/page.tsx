"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthShell,
  buttonClassName,
  inputClassName,
} from "@/components/auth/auth-shell";
import { apiClient } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      await apiClient("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      sessionStorage.setItem("signup-email", email.trim());
      router.push("/signup/verify");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create your account.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start sending, receiving, and converting money securely."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-semibold text-neutral-950 underline" href="/login">
            Sign in
          </Link>
        </>
      }
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

        <label className="block text-sm font-medium text-neutral-800">
          Phone
          <input
            autoComplete="tel"
            className={inputClassName}
            disabled={isLoading}
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            value={phone}
          />
        </label>

        <label className="block text-sm font-medium text-neutral-800">
          Password
          <input
            autoComplete="new-password"
            className={inputClassName}
            disabled={isLoading}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        <label className="block text-sm font-medium text-neutral-800">
          Confirm password
          <input
            autoComplete="new-password"
            className={inputClassName}
            disabled={isLoading}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
        </label>

        <button className={buttonClassName} disabled={isLoading} type="submit">
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
