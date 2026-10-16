"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      // Always redirect to login regardless of whether the account exists, so the
      // response does not reveal which emails are registered.
      router.replace("/login?reset=sent");
    } catch {
      // Handle error silently - the generic login screen copy applies either way
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-md p-6">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
            className="w-full appearance-none rounded border border-gray-400 px-3 py-2 leading-tight text-gray-700 shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="enter your email"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
