"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { DEFAULT_PAIRS, getRates } from "@/lib/api/exchange-rates";
import {
  type AlertDirection,
  type CreateAlertInput,
  validateAlertInput,
} from "@/lib/api/alerts";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateAlertInput) => Promise<void>;
  busy?: boolean;
  atLimit?: boolean;
};

export function CreateAlertDialog({
  open,
  onClose,
  onCreate,
  busy = false,
  atLimit = false,
}: Props) {
  const [pair, setPair] = useState(DEFAULT_PAIRS[0] ?? "XLM/USD");
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [targetRate, setTargetRate] = useState("");
  const [note, setNote] = useState("");
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingRate(true);
    getRates([pair])
      .then((res) => {
        if (cancelled) return;
        const quote = res.quotes.find((q) => q.pair === pair);
        setCurrentRate(quote?.rate ?? null);
      })
      .catch(() => {
        if (!cancelled) setCurrentRate(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingRate(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, pair]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (atLimit) {
      setError("You have reached the maximum number of alerts.");
      return;
    }
    const rateNum = Number(targetRate);
    const validationError = validateAlertInput({
      pair,
      direction,
      targetRate: rateNum,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      await onCreate({
        pair,
        direction,
        targetRate: rateNum,
        note: note.trim() || undefined,
      });
      setTargetRate("");
      setNote("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create alert.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create rate alert"
      description="Get notified when a currency pair crosses your target rate."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {atLimit && (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            You have reached the alert limit. Delete an existing alert to create
            a new one.
          </p>
        )}

        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Pair
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={busy || atLimit}
          >
            {DEFAULT_PAIRS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Current rate:{" "}
          {loadingRate
            ? "Loading…"
            : currentRate != null
              ? currentRate.toLocaleString(undefined, {
                  maximumFractionDigits: 8,
                })
              : "Unavailable"}
        </p>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Direction
          </legend>
          <div className="flex gap-4">
            {(["above", "below"] as const).map((dir) => (
              <label
                key={dir}
                className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="radio"
                  name="direction"
                  value={dir}
                  checked={direction === dir}
                  onChange={() => setDirection(dir)}
                  disabled={busy || atLimit}
                />
                Alert when rate goes {dir}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Target rate
          <input
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            placeholder="e.g. 1.25"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={busy || atLimit}
            required
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Note{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={busy || atLimit}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || atLimit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create alert"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
