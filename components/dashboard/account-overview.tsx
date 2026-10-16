"use client";

import { useState } from "react";
import { useWallets } from "@/hooks/use-wallets";
import { usePersistedFlag } from "@/hooks/use-persisted-flag";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyIcon } from "@/components/shared/currency-icon";
import { formatMoney } from "@/lib/money";
import { notify } from "@/lib/notify";
import type { WalletBalance } from "@/lib/api/wallets";

const HIDDEN_KEY = "nexafx.balances-hidden";
const MASK = "••••••";

function BalanceRow({
  wallet,
  hidden,
}: {
  wallet: WalletBalance;
  hidden: boolean;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
      <span className="flex items-center gap-3">
        <CurrencyIcon code={wallet.currency} />
        <span className="text-sm font-medium text-gray-900">
          {wallet.currency}
        </span>
      </span>
      <span className="text-sm font-semibold text-gray-900 tabular-nums">
        {hidden ? MASK : formatMoney(wallet.balance, wallet.currency)}
      </span>
    </li>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
        >
          <Skeleton width={120} height={20} />
          <Skeleton width={80} height={20} />
        </div>
      ))}
    </div>
  );
}

export function AccountOverview() {
  const { data, isPending, isError, refetch, isFetching } = useWallets();
  const [hidden, setHidden] = usePersistedFlag(HIDDEN_KEY);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const address = data?.depositAddress;
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      notify.success("Deposit address copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      notify.error("Could not copy the address");
    }
  };

  return (
    <section aria-labelledby="account-overview-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="account-overview-heading"
          className="text-lg font-semibold text-gray-900"
        >
          Account overview
        </h2>
        <button
          type="button"
          onClick={() => setHidden(!hidden)}
          aria-pressed={hidden}
          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {hidden ? "Show balances" : "Hide balances"}
        </button>
      </div>

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>We couldn&apos;t load your balances.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : data.balances.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          You don&apos;t have any balances yet.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {data.balances.map((wallet) => (
              <BalanceRow
                key={wallet.currency}
                wallet={wallet}
                hidden={hidden}
              />
            ))}
          </ul>
          {isFetching && (
            <p className="mt-2 text-xs text-gray-400" aria-live="polite">
              Refreshing…
            </p>
          )}
        </>
      )}

      {data?.depositAddress && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Deposit address
          </p>
          <div className="mt-2 flex items-center gap-3">
            <code className="truncate rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
              {data.depositAddress}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
