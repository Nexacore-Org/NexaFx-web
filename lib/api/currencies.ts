import { apiClient } from "../api-client";

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

export async function getCurrencies(): Promise<Currency[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiClient<any>("/currencies", { useProxy: false });
  return Array.isArray(data) ? data : (data.data ?? data.currencies ?? []);
}

export async function getBaseCurrency(): Promise<Currency> {
  return apiClient<Currency>("/currencies/base", { useProxy: false });
}
