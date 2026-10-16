export const queryKeys = {
  currencies: ['currencies'],
  walletBalances: (address: string) => ['wallet-balances', address],
  transactions: ['transactions'],
  rates: (base: string) => ['rates', base],
  notifications: ['notifications'],
}