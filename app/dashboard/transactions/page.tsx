import { Transaction } from "@/types/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionList } from "@/components/dashboard/transaction/TransactionList";

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
    <div className="container mx-auto p-6 space-y-6">
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <TransactionList transactions={dummyTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}

