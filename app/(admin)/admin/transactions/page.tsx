import TransactionsTable from "@/components/admin/transactions-table";
import { getAdminTransactions } from "@/lib/api/admin";

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <a
            href={`/admin/transactions?page=${Math.max(1, page - 1)}${search ? `&search=${encodeURIComponent(search)}` : ""}${type ? `&type=${encodeURIComponent(type)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </a>
          <a
            href={`/admin/transactions?page=${Math.min(totalPages, page + 1)}${search ? `&search=${encodeURIComponent(search)}` : ""}${type ? `&type=${encodeURIComponent(type)}` : ""}${status ? `&status=${encodeURIComponent(status)}` : ""}`}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
