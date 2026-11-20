import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTransaction } from "@/lib/api/admin";

export default async function AdminTransactionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const filters = await searchParams;
  const tx = await getAdminTransaction(id);
  if (!tx) notFound();

  const back = new URLSearchParams(
    Object.entries(filters).filter((e): e is [string, string] => !!e[1]),
  ).toString();
  const rows: [string, string][] = [
    ["Reference", tx.reference],
    ["Type", tx.type],
    ["Amount", `${tx.amount} ${tx.currency}`],
    ["Status", tx.status],
    ["Counterparty", tx.counterparty ?? "-"],
    ["Created", tx.createdAt || "-"],
    ["ID", tx.id],
  ];

  return (
    <div className="space-y-6">
      <Link href={`/admin/transactions${back ? `?${back}` : ""}`} className="text-sm hover:underline">
        ← Back to transactions
      </Link>
      <h1 className="text-2xl font-semibold">Transaction {tx.reference}</h1>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
