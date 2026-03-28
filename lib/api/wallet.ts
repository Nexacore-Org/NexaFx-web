import { apiClient } from "../api-client";

export interface WalletBalance {
  currency: string;
  balance: string;
}

export async function getBalances(): Promise<WalletBalance[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiClient<any>("/wallets/balances", {
    method: "GET",
    useProxy: false,
  });
  return Array.isArray(data) ? data : (data.data ?? data.balances ?? []);
}
