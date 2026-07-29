import { apiClient } from "../api-client";

export interface WalletBalance {
  currency: string;
  balance: string;
}

interface WalletBalancesResponse {
  data?: WalletBalance[];
  balances?: WalletBalance[];
}

interface WalletBalancesResponse {
  data?: WalletBalance[];
  balances?: WalletBalance[];
}

export async function getBalances(): Promise<WalletBalance[]> {
  // The correct backend route is `/users/wallet/balances` (not `/wallets/balances`).
  // This route is protected and should be called directly (no proxy) —
  // other authenticated user endpoints use `useProxy: false` as well.
    const data = await apiClient<WalletBalancesResponse | WalletBalance[]>("/users/wallet/balances", {
    method: "GET",
    useProxy: false,
  });
  return (Array.isArray(data) ? data : (data.data ?? data.balances ?? [])) as WalletBalance[];
}
