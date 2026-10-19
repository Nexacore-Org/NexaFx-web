"use client";

import { useState, type FormEvent } from "react";

import { Dialog } from "@/components/ui/dialog";
import {
  createSchedule,
  frequencyLabel,
  validateSchedule,
  type CreateScheduleInput,
  type Schedule,
  type ScheduleFrequency,
} from "@/lib/api/schedules";
import { currencies } from "@/lib/currencies";

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: (schedule: Schedule) => void;
}

const CURRENCY_CODES = Object.values(currencies).map((c) => c.code);
const FREQUENCIES: ScheduleFrequency[] = ["once", "weekly", "monthly"];

const EMPTY: CreateScheduleInput = {
  fromCurrency: "USD",
  toCurrency: "NGN",
  amount: "",
  frequency: "monthly",
  startDate: "",
  endDate: null,
};

export default function ScheduleForm({
  open,
  onClose,
  onCreated,
}: ScheduleFormProps) {
  const [input, setInput] = useState<CreateScheduleInput>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validateSchedule>>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof CreateScheduleInput>(
    key: K,
    value: CreateScheduleInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function close() {
    setInput(EMPTY);
    setErrors({});
    onClose();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateSchedule(input);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createSchedule(input);
      onCreated(created);
      close();
    } catch (err) {
      setErrors({
        amount:
          err instanceof Error ? err.message : "Failed to create schedule",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="New schedule"
      description="The exchange rate is applied when the schedule runs, not when you create it."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="sched-from"
              className="mb-1 block text-sm font-medium"
            >
              From
            </label>
            <select
              id="sched-from"
              value={input.fromCurrency}
              onChange={(e) => update("fromCurrency", e.target.value)}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="sched-to"
              className="mb-1 block text-sm font-medium"
            >
              To
            </label>
            <select
              id="sched-to"
              value={input.toCurrency}
              onChange={(e) => update("toCurrency", e.target.value)}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {CURRENCY_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.pair && (
          <p role="alert" className="text-sm text-red-600">
            {errors.pair}
          </p>
        )}

        <div>
          <label
            htmlFor="sched-amount"
            className="mb-1 block text-sm font-medium"
          >
            Amount ({input.fromCurrency})
          </label>
          <input
            id="sched-amount"
            inputMode="decimal"
            value={input.amount}
            onChange={(e) => update("amount", e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.amount && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sched-frequency"
            className="mb-1 block text-sm font-medium"
          >
            Frequency
          </label>
          <select
            id="sched-frequency"
            value={input.frequency}
            onChange={(e) =>
              update("frequency", e.target.value as ScheduleFrequency)
            }
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {frequencyLabel(f)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="sched-start"
              className="mb-1 block text-sm font-medium"
            >
              Start date
            </label>
            <input
              id="sched-start"
              type="date"
              value={input.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.startDate && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.startDate}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="sched-end"
              className="mb-1 block text-sm font-medium"
            >
              End date (optional)
            </label>
            <input
              id="sched-end"
              type="date"
              value={input.endDate ?? ""}
              onChange={(e) => update("endDate", e.target.value || null)}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errors.endDate && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        <p className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          We&apos;ll convert {input.amount || "0"} {input.fromCurrency} to{" "}
          {input.toCurrency} {frequencyLabel(input.frequency).toLowerCase()},
          starting {input.startDate || "on the chosen date"}. The rate at
          execution time applies.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {submitting ? "Creating…" : "Create schedule"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
