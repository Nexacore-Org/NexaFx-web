"use client";

import Link from "next/link";
import type { ConvertValues } from "@/components/convert/convert-form";
import type { ConvertQuote } from "@/hooks/use-convert-quote";
import type { Transaction } from "@/lib/api/transactions";
import { formatAmount } from "@/lib/convert-amount";

export interface ConvertSuccessProps {
  values: ConvertValues;
  quote: ConvertQuote;
  transaction: Transaction;
  onReset: () => void;
}

/** Only ever rendered after createSwap has resolved. */
export function ConvertSuccess({
  values,
  quote,
  transaction,
  onReset,
}: ConvertSuccessProps) {
  return (
    <section
      aria-labelledby="convert-success-title"
      className="flex flex-col gap-4"
    >
      <h2 id="convert-success-title" className="text-lg font-semibold">
        Conversion complete
      </h2>
      <p role="status">
        You converted {formatAmount(values.amount, values.from)} {values.from}{" "}
        to {formatAmount(quote.toAmount, values.to)} {values.to}.
      </p>
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt>Reference</dt>
        <dd className="text-right font-mono">
          {transaction.referenceId ?? transaction.id}
        </dd>
      </dl>
      <div className="flex gap-2">
        <Link
          href={`/transactions/${encodeURIComponent(transaction.id)}`}
          className="rounded-md border px-4 py-2"
        >
          View transaction
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Convert again
        </button>
      </div>
    </section>
  );
}
