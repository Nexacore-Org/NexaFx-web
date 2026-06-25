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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const nextErrors = {
      email: email.trim() ? "" : "Email is required",
      password: password ? "" : "Password is required",
    };
    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsLoading(true);

    try {
      await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      sessionStorage.setItem("login-email", email.trim());
      router.push("/verify-otp");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your NexaFx account."
      footer={
        <>
          New to NexaFx?{" "}
          <Link className="font-semibold text-neutral-950 underline" href="/signup">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
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
            name="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((current) => ({ ...current, email: "" }));
            }}
            type="email"
            value={email}
          />
          {fieldErrors.email ? (
            <span className="mt-2 block text-sm text-red-600">
              {fieldErrors.email}
            </span>
          ) : null}
        </label>

        <label className="block text-sm font-medium text-neutral-800">
          Password
          <input
            autoComplete="current-password"
            className={inputClassName}
            disabled={isLoading}
            name="password"
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((current) => ({ ...current, password: "" }));
            }}
            type="password"
            value={password}
          />
          {fieldErrors.password ? (
            <span className="mt-2 block text-sm text-red-600">
              {fieldErrors.password}
            </span>
          ) : null}
        </label>

        <div className="text-right">
          <Link
            className="text-sm font-medium text-neutral-700 underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <button className={buttonClassName} disabled={isLoading} type="submit">
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
