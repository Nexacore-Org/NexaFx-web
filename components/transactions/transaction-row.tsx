"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Transaction } from "@/lib/api/transactions";
import { CurrencyIcon } from "@/components/shared/currency-icon";

export interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const {
    id,
    type,
    status,
    sourceAmount,
    sourceCurrency,
    destinationAmount,
    destinationCurrency,
    createdAt,
    counterparty,
    description,
  } = transaction;

  const date = new Date(createdAt);
  const formattedDate = !isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : createdAt;

  const typeConfig: Record<
    string,
    { label: string; sign: string; colorClass: string; iconPath: string }
  > = {
    convert: {
      label: "Convert",
      sign: "",
      colorClass:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
      iconPath: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    },
    deposit: {
      label: "Deposit",
      sign: "+",
      colorClass:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
      iconPath: "M19 14l-7 7m0 0l-7-7m7 7V3",
    },
    withdraw: {
      label: "Withdraw",
      sign: "-",
      colorClass:
        "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
      iconPath: "M5 10l7-7m0 0l7 7m-7-7v18",
    },
    transfer: {
      label: "Transfer",
      sign: "-",
      colorClass:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
      iconPath: "M14 5l7 7m0 0l-7 7m7-7H3",
    },
  };

  const currentType = typeConfig[type] ?? typeConfig.convert;

  const statusBadge = {
    completed:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  }[status];

  const primaryTitle =
    description ??
    (type === "convert" && destinationCurrency
      ? `Convert ${sourceCurrency} → ${destinationCurrency}`
      : `${currentType.label} ${sourceCurrency}`);

  return (
    <Link
      href={`/transactions/${id}`}
      className="group flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
      aria-label={`${primaryTitle}, status ${status}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${currentType.colorClass}`}
          aria-hidden="true"
        >
          <svg
            className="h-5 w-5 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={currentType.iconPath} />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
              {primaryTitle}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge}`}
            >
              {status}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <time dateTime={createdAt}>{formattedDate}</time>
            {counterparty && (
              <>
                <span>•</span>
                <span className="truncate">{counterparty}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="flex items-center justify-end gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
          <CurrencyIcon code={sourceCurrency} />
          <span>
            {currentType.sign}
            {formatMoney(sourceAmount, sourceCurrency)}
          </span>
        </div>

        {destinationAmount !== undefined && destinationCurrency && (
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            ≈ {formatMoney(destinationAmount, destinationCurrency)}{" "}
            {destinationCurrency}
          </div>
        )}
      </div>
    </Link>
  );
}
