import { ApiError, OfflineError } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Client-side exchange-rate cache
// Keyed by the request's cache key (e.g. "all" or "USD/NGN").
// TTL is 30 seconds — short enough that rates stay acceptably fresh while
// eliminating redundant parallel fetches when multiple components on the
// same page request the same rate simultaneously.
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 30_000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const rateCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = rateCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    rateCache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  rateCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// In-flight deduplication — if the same key is already being fetched,
// callers share the same promise rather than issuing a duplicate request.
const inflight = new Map<string, Promise<unknown>>();

async function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== undefined) return cached;

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = fetcher().then((data) => {
    setCache(key, data);
    inflight.delete(key);
    return data;
  }).catch((err) => {
    inflight.delete(key);
    throw err;
  });

  inflight.set(key, promise as Promise<unknown>);
  return promise;
}

export async function getExchangeRates() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new OfflineError("No internet connection");
  }

  return dedupedFetch("all", async () => {
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
  });
}

export async function getExchangeRate(
  from: string,
  to: string,
): Promise<{ rate: number }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new OfflineError("No internet connection");
  }

  const cacheKey = `${from}/${to}`;

  return dedupedFetch(cacheKey, async () => {
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
  });
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

