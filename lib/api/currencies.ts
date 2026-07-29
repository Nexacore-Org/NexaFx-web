import { apiClient } from "../api-client";

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

interface CurrenciesResponse {
  data?: Currency[];
  currencies?: Currency[];
}

interface CurrenciesResponse {
  data?: Currency[];
  currencies?: Currency[];
}

export async function getCurrencies(): Promise<Currency[]> {
    const data = await apiClient<CurrenciesResponse | Currency[]>("/currencies", { useProxy: false });
  return (Array.isArray(data) ? data : (data.data ?? data.currencies ?? [])) as Currency[];
}

export async function getBaseCurrency(): Promise<Currency> {
  return apiClient<Currency>("/currencies/base", { useProxy: false });
}
