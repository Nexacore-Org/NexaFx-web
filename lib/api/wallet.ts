const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface WalletBalance {
  currency: string;
  balance: string;
}

export async function getBalances(): Promise<WalletBalance[]> {
  const res = await fetch(`${API_BASE}/wallets/balances`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to fetch balances");
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? data.balances ?? []);
}
