const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

export async function getCurrencies(): Promise<Currency[]> {
  const res = await fetch(`${API_BASE}/currencies`);
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? data.currencies ?? []);
}

export async function getBaseCurrency(): Promise<Currency> {
  const res = await fetch(`${API_BASE}/currencies/base`);
  if (!res.ok) throw new Error("Failed to fetch base currency");
  return res.json();
}
