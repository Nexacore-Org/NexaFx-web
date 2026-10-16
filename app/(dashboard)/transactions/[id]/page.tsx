import { notFound } from "next/navigation";
import { fetchTransaction } from "@/lib/api/transactions";
import { TransactionDetail } from "@/components/transactions/transaction-detail";

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { id } = await params;

  let transaction;
  try {
    transaction = await fetchTransaction(id);
  } catch {
    // Unexpected server error — treat as not found to avoid leaking details.
    notFound();
  }

  if (!transaction) {
    notFound();
  }

  return (
    <TransactionDetail
      transaction={transaction}
      // userName would come from the session in a real app.
      userName="NexaFx User"
    />
  );
}
