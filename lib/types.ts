export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  currency: string;
  date: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  senderName: string;
  walletAddress: string;
  createdAt: string;
  status: "Pending" | "Paid";
}
