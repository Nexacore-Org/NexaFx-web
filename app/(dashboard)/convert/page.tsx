"use client";

import { useState } from "react";
import { SectionErrorBoundary } from "@/components/shared/section-error-boundary";

export default function ConvertPage() {
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "quoting" | "confirming" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const balance = 100000; // NGN demo balance

  async function getQuote() {
    setError("");
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (n > balance) {
      setError("Amount exceeds available balance");
      setQuote(null);
      return;
    }
    setStatus("quoting");
    try {
      const res = await fetch("/api/convert/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n, from: "NGN", to: "USD" }),
      });
      if (!res.ok) throw new Error("quote failed");
      const data = await res.json();
      setQuote(String(data.usdAmount ?? (n / 1500).toFixed(2)));
      setStatus("idle");
    } catch {
      setError("Could not fetch quote");
      setStatus("error");
    }
  }

  async function confirm() {
    setStatus("confirming");
    setError("");
    try {
      const res = await fetch("/api/convert/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), from: "NGN", to: "USD" }),
      });
      if (!res.ok) throw new Error("confirm failed");
      setStatus("success");
    } catch {
      setError("Conversion failed");
      setStatus("error");
    }
  }

  return (
    <SectionErrorBoundary section="convert-flow">
    <div className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-xl font-semibold">Convert</h1>
      <p className="text-sm text-gray-600">Available balance: {balance.toLocaleString()} NGN</p>
      <div>
        <label htmlFor="convert-amount" className="mb-1 block text-sm font-medium">
          Amount (NGN)
        </label>
        <input
          id="convert-amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {quote && (
        <p data-testid="convert-quote" className="text-sm">
          Quote: <strong>{quote} USD</strong>
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={getQuote}
          disabled={status === "quoting"}
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Get quote
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={!quote || status === "confirming"}
          className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {status === "confirming" ? "Confirming…" : "Confirm conversion"}
        </button>
      </div>
      {status === "success" && (
        <p role="status" className="text-sm text-green-700">
          Conversion successful. Updated balance will appear shortly.
        </p>
      )}
    </div>
    </SectionErrorBoundary>
  );
}

export default function ConvertPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Convert</h1>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="h-96 w-full animate-pulse rounded-md bg-gray-200"
          />
        }
      >
        <ConvertFromParams searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
