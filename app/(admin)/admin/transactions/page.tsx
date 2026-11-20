import TransactionsTable from "@/components/admin/transactions-table";
import { getAdminTransactions } from "@/lib/api/admin";
import AdminPagination from "@/components/admin/pagination";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; type?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? "";
  const type = params.type ?? "";
  const status = params.status ?? "";

  const { transactions, total, pageSize } = await getAdminTransactions({
    page,
    search,
    type,
    status,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <TransactionsTable transactions={transactions} />
      <AdminPagination
        basePath="/admin/transactions"
        params={params}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
