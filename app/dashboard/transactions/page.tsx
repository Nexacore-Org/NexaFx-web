import { TransactionList } from "@/components/dashboard/TransactionList";
import { Transaction } from "@/types/transaction";

// Dummy transaction data
const dummyTransactions: Transaction[] = [
  {
    id: "1",
    type: "Deposit",
    fromCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  },
  {
    id: "2",
    type: "Withdraw",
    fromCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  },
  {
    id: "3",
    type: "Convert",
    fromCurrency: "NGN",
    toCurrency: "USD",
    date: "04.07.2025 12:40 AM",
    status: "Failed",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  },
  {
    id: "4",
    type: "Withdraw",
    fromCurrency: "USD",
    date: "04.07.2025 12:40 AM",
    status: "Success",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  },
  {
    id: "5",
    type: "Convert",
    fromCurrency: "NGN",
    toCurrency: "USD",
    date: "04.07.2025 12:40 AM",
    status: "Failed",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  },
  {
    id: "6",
    type: "Withdraw",
    fromCurrency: "NGN",
    toCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  },
  {
    id: "7",
    type: "Convert",
    fromCurrency: "NGN",
    toCurrency: "USD",
    date: "04.07.2025 12:40 AM",
    status: "Failed",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  },
  {
    id: "8",
    type: "Deposit",
    fromCurrency: "NGN",
    date: "04.07.2025 12:40 AM",
    status: "Success",
    amount: "+ 200,000 NGN",
    usdAmount: "80 USD"
  }
];

export default function TransactionsPage() {
  return (
    <div className="p-6">
      <TransactionList transactions={dummyTransactions} />
    </div>
  );
}

// For testing empty state, you can replace dummyTransactions with an empty array:
// <TransactionList transactions={[]} /> 