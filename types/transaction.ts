export type TransactionType = "Deposit" | "Withdraw" | "Convert";
export type TransactionStatus = "Success" | "Failed";
export type TransactionFilter = "All" | "Deposit" | "Withdrawal" | "Convert";

export interface Transaction {
  id: string;
  type: TransactionType;
  fromCurrency: string;
  toCurrency?: string;
  date: string;
  status: TransactionStatus;
  amount: string;
  usdAmount: string;
} 