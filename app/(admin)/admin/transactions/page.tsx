import TransactionsTable from "@/components/admin/transactions-table";
import { getAdminTransactions } from "@/lib/api/admin";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? "";
  const type = params.type ?? "";
  const status = params.status ?? "";
  const from = params.from ?? "";
  const to = params.to ?? "";

  const { transactions, total, pageSize } = await getAdminTransactions({
    page,
    search,
    type,
    status,
    from,
    to,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <form method="get" className="flex flex-wrap items-end gap-3 text-sm">
        {/* Submitting a GET form drops `page`, so results reset to page 1. */}
        <label className="flex flex-col gap-1">
          Search
          <input name="search" defaultValue={search} className="rounded-md border px-3 py-1.5" />
        </label>
        <label className="flex flex-col gap-1">
          Type
          <select name="type" defaultValue={type} className="rounded-md border px-3 py-1.5">
            <option value="">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="conversion">Conversion</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Status
          <select name="status" defaultValue={status} className="rounded-md border px-3 py-1.5">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          From
          <input type="date" name="from" defaultValue={from} className="rounded-md border px-3 py-1.5" />
        </label>
        <label className="flex flex-col gap-1">
          To
          <input type="date" name="to" defaultValue={to} className="rounded-md border px-3 py-1.5" />
        </label>
        <button type="submit" className="rounded-md border px-3 py-1.5">Apply filters</button>
      </form>
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
