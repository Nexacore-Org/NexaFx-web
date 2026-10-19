export const queryKeys = {
  currencies: ["currencies"],
  wallets: ["wallets"],
  walletBalances: (address: string) => ["wallet-balances", address],
  transactions: ["transactions"],
  rates: (base: string) => ["rates", base],
  notifications: ["notifications"],
  profile: ["profile"],
  schedules: ["schedules"],
};
