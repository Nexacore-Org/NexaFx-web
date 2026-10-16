import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { CurrencyIcon } from "@/components/shared/currency-icon";

export const instant = false;

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to Transactions
        </Link>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          Completed
        </span>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 pb-6 dark:border-zinc-800">
          <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            Transaction Details
          </p>
          <div className="mt-2 flex items-center gap-2">
            <CurrencyIcon code="USD" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatMoney(100, "USD")} USD
            </h1>
          </div>
        </div>

        <dl className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 dark:text-zinc-400">Transaction ID</dt>
            <dd className="font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {id}
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 dark:text-zinc-400">Type</dt>
            <dd className="font-medium text-zinc-900 capitalize dark:text-zinc-100">
              Conversion
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 dark:text-zinc-400">Network</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              Stellar Horizon
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 dark:text-zinc-400">Date & Time</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              {new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
