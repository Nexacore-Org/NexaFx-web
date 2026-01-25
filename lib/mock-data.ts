export type TransactionStatus = "Success" | "Pending" | "Failed";
export type TransactionType = "Deposit" | "Withdraw" | "Convert";

export interface Transaction {
    id: string;
    type: TransactionType;
    currency: string;
    toCurrency?: string;
    amount: number;
    amountString: string; 
    date: string;
    status: TransactionStatus;
    reference: string;
    description?: string;
}

export const mockTransactions: Transaction[] = [
    {
        id: "1",
        type: "Deposit",
        currency: "NGN",
        amount: 200000,
        amountString: "+ 200,000 NGN",
        date: "04.07.2025 12:40 AM",
        status: "Success",
        reference: "TXN-1234567890",
    },
    {
        id: "2",
        type: "Withdraw",
        currency: "NGN",
        amount: 50000,
        amountString: "- 50,000 NGN",
        date: "04.07.2025 12:40 AM",
        status: "Success",
        reference: "TXN-1234567891",
    },
    {
        id: "3",
        type: "Convert",
        currency: "NGN",
        toCurrency: "USD",
        amount: 100000,
        amountString: "100,000 NGN",
        date: "04.07.2025 12:40 AM",
        status: "Failed",
        reference: "TXN-1234567892",
    },
    {
        id: "4",
        type: "Withdraw",
        currency: "USD",
        amount: 100,
        amountString: "- 100 USD",
        date: "04.07.2025 12:40 AM",
        status: "Success",
        reference: "TXN-1234567893",
    },
    {
        id: "5",
        type: "Convert",
        currency: "NGN",
        toCurrency: "USD",
        amount: 50000,
        amountString: "50,000 NGN",
        date: "04.07.2025 12:40 AM",
        status: "Failed",
        reference: "TXN-1234567894",
    },
    {
        id: "6",
        type: "Withdraw",
        currency: "NGN",
        toCurrency: "NGN",
        amount: 200000,
        amountString: "- 200,000 NGN",
        date: "04.07.2025 12:40 AM",
        status: "Success",
        reference: "TXN-1234567895",
    },
    {
        id: "7",
        type: "Convert",
        currency: "NGN",
        toCurrency: "USD",
        amount: 200000,
        amountString: "200,000 NGN",
        date: "04.07.2025 12:40 AM",
        status: "Failed",
        reference: "TXN-1234567896",
    },
    {
        id: "8",
        type: "Deposit",
        currency: "NGN",
        amount: 200000,
        amountString: "+ 200,000 NGN",
        date: "04.07.2025 12:40 AM",
        status: "Success",
        reference: "TXN-1234567897",
    },
  
  
];
