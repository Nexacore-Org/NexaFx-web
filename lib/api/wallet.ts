import { apiClient } from "../api-client";

export interface WalletBalance {
  currency: string;
  balance: string;
}

export async function getBalances(): Promise<WalletBalance[]> {
  // The correct backend route is `/users/wallet/balances` (not `/wallets/balances`).
  // This route is protected and should be called directly (no proxy) —
  // other authenticated user endpoints use `useProxy: false` as well.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiClient<any>("/users/wallet/balances", {
    method: "GET",
    useProxy: false,
  });
  return Array.isArray(data) ? data : (data.data ?? data.balances ?? []);
}
