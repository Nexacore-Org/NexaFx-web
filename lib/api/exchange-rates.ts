import { ApiError, OfflineError } from "@/lib/api-client";

export async function getExchangeRate(from: string, to: string) {
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

  return res.json();
}
