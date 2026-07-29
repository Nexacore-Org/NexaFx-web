import { ApiError, OfflineError } from "@/lib/api-client";

export async function getExchangeRates() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new OfflineError("No internet connection");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) {
    headers.set("x-client-token", token);
  }

  let res: Response;

  try {
    res = await fetch("/api/exchange-rates", {
      method: "GET",
      headers,
    });
  } catch (error) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new OfflineError("No internet connection");
    }
    throw error;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      data?.error || data?.message || res.statusText,
      res.status,
    );
  }

  return res.json();
}

export async function getExchangeRate(
  from: string,
  to: string,
): Promise<{ rate: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new OfflineError("No internet connection");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) {
    headers.set("x-client-token", token);
  }

  let res: Response;

  try {
    res = await fetch(`/api/exchange-rates?from=${from}&to=${to}`, {
      method: "GET",
      headers,
    });
  } catch (error) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new OfflineError("No internet connection");
    }

    throw error;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      data?.error || data?.message || res.statusText,
      res.status,
    );
  }

  const data = await res.json();
  return { rate: Number(data.rate) };
}

export interface LockedRate {
  lockId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lockedAmount: number;
  toAmount: number;
  expiresAt: string;
}

export async function lockExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  amount: number
): Promise<LockedRate> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new OfflineError("No internet connection");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) {
    headers.set("x-client-token", token);
  }

  let res: Response;

  try {
    res = await fetch(`/api/exchange-rates/lock`, {
      method: "POST",
      headers,
      body: JSON.stringify({ fromCurrency, toCurrency, amount }),
    });
  } catch (error) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new OfflineError("No internet connection");
    }
    throw error;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      data?.error || data?.message || res.statusText,
      res.status,
    );
  }

  return res.json();
}

