export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  currency: string;
  date: string;
}
