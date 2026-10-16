"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { truncateAddress } from "@/lib/stellar";
import { notify } from "@/lib/notify";
import { CurrencyIcon } from "@/components/shared/currency-icon";
import { OnchainDetails } from "@/components/transactions/onchain-details";
import { ReceiptButton } from "@/components/transactions/receipt-button";
import { type Transaction } from "@/lib/api/transactions";

// ---------------------------------------------------------------------------
// StatusPill
// ---------------------------------------------------------------------------

interface StatusPillProps {
  status: Transaction["status"];
}

function StatusPill({ status }: StatusPillProps) {
  const styles: Record<Transaction["status"], string> = {
    completed:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

interface CopyButtonProps {
  value: string;
  label: string;
}

function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      notify.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error("Failed to copy to clipboard");
    }
  }, [value, label]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? "Copied!" : `Copy ${label}`}
      className="ml-2 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
    >
      {copied ? (
        <svg
          className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// DetailRow
// ---------------------------------------------------------------------------

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 py-3">
      <dt className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type config
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  string,
  { label: string; sign: string; colorClass: string; iconPath: string }
> = {
  convert: {
    label: "Conversion",
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
    label: "Withdrawal",
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface TransactionDetailProps {
  transaction: Transaction;
  /** Display name of the current user, used for PDF receipts. */
  userName?: string;
}

export function TransactionDetail({
  transaction,
  userName = "NexaFx User",
}: TransactionDetailProps) {
  const tx = transaction;
  const typeConfig = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.convert;

  const formattedDate = (() => {
    const d = new Date(tx.createdAt);
    return isNaN(d.getTime())
      ? tx.createdAt
      : d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        });
  })();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Back + status header */}
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Transactions
        </Link>
        <StatusPill status={tx.status} />
      </div>

      {/* Primary amount card */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {/* Title row */}
        <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${typeConfig.colorClass}`}
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={typeConfig.iconPath} />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              {typeConfig.label}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <CurrencyIcon code={tx.sourceCurrency} />
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {typeConfig.sign}
                {formatMoney(tx.sourceAmount, tx.sourceCurrency)}{" "}
                {tx.sourceCurrency}
              </h1>
            </div>
            {tx.destinationAmount !== undefined && tx.destinationCurrency && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                ≈ <CurrencyIcon code={tx.destinationCurrency} />{" "}
                {formatMoney(tx.destinationAmount, tx.destinationCurrency)}{" "}
                {tx.destinationCurrency}
              </p>
            )}
          </div>
        </div>

        {/* Detail rows */}
        <dl className="divide-y divide-zinc-100 px-6 dark:divide-zinc-800">
          {/* Reference ID */}
          <DetailRow label="Reference ID">
            <div className="flex items-center justify-end gap-1">
              <span className="font-mono text-xs">
                {tx.referenceId ?? tx.id}
              </span>
              <CopyButton
                value={tx.referenceId ?? tx.id}
                label="reference ID"
              />
            </div>
          </DetailRow>

          {/* Internal ID */}
          <DetailRow label="Transaction ID">
            <div className="flex items-center justify-end gap-1">
              <span className="font-mono text-xs">{tx.id}</span>
              <CopyButton value={tx.id} label="transaction ID" />
            </div>
          </DetailRow>

          <DetailRow label="Type">
            <span className="capitalize">{typeConfig.label}</span>
          </DetailRow>

          <DetailRow label="Status">
            <StatusPill status={tx.status} />
          </DetailRow>

          <DetailRow label="Date & Time">
            <time dateTime={tx.createdAt}>{formattedDate}</time>
          </DetailRow>

          {/* Rate */}
          {tx.rate !== undefined && tx.destinationCurrency && (
            <DetailRow label="Exchange Rate">
              1 {tx.sourceCurrency} ={" "}
              {formatMoney(tx.rate, tx.destinationCurrency)}{" "}
              {tx.destinationCurrency}
            </DetailRow>
          )}

          {/* Fee */}
          {tx.fee !== undefined && (
            <DetailRow label="Fee">
              {formatMoney(tx.fee, tx.sourceCurrency)} {tx.sourceCurrency}
            </DetailRow>
          )}

          {/* Destination address */}
          {tx.counterparty && (
            <DetailRow label="Destination">
              <div className="flex items-center justify-end gap-1">
                {/* Show full address for Stellar, truncate for long strings */}
                <span
                  className="font-mono text-xs break-all"
                  title={tx.counterparty}
                >
                  {tx.counterparty.length === 56 &&
                  tx.counterparty.startsWith("G")
                    ? truncateAddress(tx.counterparty)
                    : tx.counterparty}
                </span>
                <CopyButton
                  value={tx.counterparty}
                  label="destination address"
                />
              </div>
            </DetailRow>
          )}

          {/* Memo */}
          {tx.memo && (
            <DetailRow label="Memo">
              <span className="font-mono text-xs">{tx.memo}</span>
            </DetailRow>
          )}

          {/* Stellar hash */}
          {tx.hash && (
            <DetailRow label="Stellar Hash">
              <div className="flex flex-wrap items-center justify-end gap-1">
                <span className="font-mono text-xs break-all" title={tx.hash}>
                  {truncateAddress(tx.hash, 8, 8)}
                </span>
                <CopyButton value={tx.hash} label="transaction hash" />
                <a
                  href={`https://stellar.expert/explorer/public/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-0.5 text-xs text-blue-600 hover:underline dark:text-blue-400"
                  aria-label="View on Stellar explorer (opens in new tab)"
                >
                  Explorer
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </DetailRow>
          )}

          {/* Description */}
          {tx.description && (
            <DetailRow label="Description">
              <span className="max-w-xs text-right">{tx.description}</span>
            </DetailRow>
          )}
        </dl>

        {/* Action row */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <ReceiptButton transaction={tx} userName={userName} />
        </div>
      </div>

      {/* On-chain details section (only when hash exists) */}
      {tx.hash && <OnchainDetails hash={tx.hash} />}
    </div>
  );
}
