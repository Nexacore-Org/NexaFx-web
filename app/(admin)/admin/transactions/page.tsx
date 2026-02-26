import { TableTransaction } from "@/components/admin/transaction/TableTransaction";
import { TransactionFilters } from "@/components/admin/transaction/TransactionFilters";

export default function TransactionPage() {
  return (
    <div className="space-y-6">
      <TransactionFilters />
      <TableTransaction />
    </div>
  );
}
