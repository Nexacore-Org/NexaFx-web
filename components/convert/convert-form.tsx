"use client";

import { useEffect, useId, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RateHistoryChart } from "@/components/convert/rate-history-chart";
import { useConvertQuote, type ConvertQuote } from "@/hooks/use-convert-quote";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useWallets } from "@/hooks/use-wallets";
import { currencies, getCurrency } from "@/lib/currencies";
import { notify } from "@/lib/notify";
import {
  DEFAULT_VALUES,
  buildConvertQuery,
  loadDraft,
  saveDraft,
  type ConvertValues,
} from "@/lib/convert-params";
import {
  countDecimals,
  formatAmount,
  formatRate,
  isAmountInput,
  toUnits,
  truncateToDecimals,
} from "@/lib/convert-amount";

export type { ConvertValues };

export interface ConvertFormProps {
  defaultValues?: Partial<ConvertValues>;
  /** True when the URL carried convert params, so a stored draft is ignored. */
  hasUrlParams?: boolean;
  onContinue?: (values: ConvertValues, quote: ConvertQuote) => void;
}

const DEBOUNCE_MS = 400;
const currencyOptions = Object.values(currencies);

const codeSchema = z
  .string()
  .refine((code) => getCurrency(code) !== undefined, "Choose a currency");

/**
 * Validation is derived from the registry (decimals) and the user's balance of
 * the "from" currency. Pass undefined while balances are still loading and the
 * balance rule is skipped (the submit button stays disabled until they load).
 */
export function buildConvertSchema(
  balances: Record<string, string> | undefined,
) {
  return z
    .object({ from: codeSchema, to: codeSchema, amount: z.string() })
    .superRefine((values, ctx) => {
      const { from, to, amount } = values;

      if (from === to) {
        ctx.addIssue({
          code: "custom",
          path: ["to"],
          message: "Choose a different currency to convert to",
        });
      }

      const currency = getCurrency(from);
      if (!currency) return;

      const fail = (message: string) =>
        ctx.addIssue({ code: "custom", path: ["amount"], message });

      if (amount.trim() === "") return fail("Enter an amount");
      if (!isAmountInput(amount) || amount === ".") {
        return fail("Enter a valid number");
      }
      if (countDecimals(amount) > currency.decimals) {
        return fail(
          `${currency.code} supports up to ${currency.decimals} decimal places`,
        );
      }

      const units = toUnits(amount, currency.decimals);
      if (units === null || units <= BigInt(0)) {
        return fail("Amount must be greater than zero");
      }

      // Loaded balances without an entry for this currency mean a zero balance.
      const balance = balances ? (balances[from] ?? "0") : undefined;
      if (balance !== undefined) {
        const balanceUnits = toUnits(
          truncateToDecimals(balance, currency.decimals),
          currency.decimals,
        );
        if (balanceUnits !== null && units > balanceUnits) {
          fail(
            `Amount exceeds your balance of ${formatAmount(balance, from)} ${from}`,
          );
        }
      }
    });
}

/**
 * Native select: keyboard and screen reader support come for free. Swap for the
 * shared Select primitive once it exists in components/ui.
 */
function CurrencySelect({
  id,
  label,
  value,
  onChange,
  disabledCode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  disabledCode: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-36 rounded-md border px-2 py-2"
      >
        {currencyOptions.map((currency) => (
          <option
            key={currency.code}
            value={currency.code}
            disabled={currency.code === disabledCode}
          >
            {currency.code} ({currency.name})
          </option>
        ))}
      </select>
    </>
  );
}

export function ConvertForm({
  defaultValues,
  hasUrlParams = false,
  onContinue,
}: ConvertFormProps) {
  const amountId = useId();
  const fromId = useId();
  const toId = useId();
  const { data: wallets, isLoading: balancesLoading } = useWallets();
  const balances = useMemo(
    () =>
      wallets
        ? Object.fromEntries(
            wallets.balances.map((entry) => [entry.currency, entry.balance]),
          )
        : undefined,
    [wallets],
  );
  const schema = useMemo(() => buildConvertSchema(balances), [balances]);

  const {
    register,
    control,
    setValue,
    reset,
    clearErrors,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<ConvertValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const [from, to, amount] = useWatch({
    control,
    name: ["from", "to", "amount"],
  });

  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);
  const balance = balances ? (balances[from] ?? "0") : undefined;

  // Restore the in-progress draft after mount (never during render, so the
  // server and first client render agree). URL params always take precedence.
  useEffect(() => {
    if (hasUrlParams) return;
    const draft = loadDraft();
    if (draft) reset({ ...DEFAULT_VALUES, ...draft });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the draft and the address bar in step with the form (shallow, no
  // navigation and no new history entry).
  useEffect(() => {
    saveDraft({ from, to, amount });
    const query = buildConvertQuery({ from, to, amount });
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}?${query}`,
    );
  }, [from, to, amount]);

  async function handleCopyLink() {
    const query = buildConvertQuery({ from, to, amount });
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    try {
      await navigator.clipboard.writeText(url);
      notify.success("Link copied");
    } catch {
      notify.error("Could not copy the link");
    }
  }

  // Re-validate once the balance arrives or the "from" currency changes.
  useEffect(() => {
    if (amount) void trigger("amount");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances, from]);

  const debouncedAmount = useDebouncedValue(amount, DEBOUNCE_MS);
  const requestValues = { from, to, amount: debouncedAmount };
  const requestable = schema.safeParse(requestValues).success;
  const currentValid = schema.safeParse({ from, to, amount }).success;
  const settled = debouncedAmount === amount;

  const {
    data: quote,
    isFetching,
    error: quoteError,
  } = useConvertQuote(requestable ? requestValues : null);

  const activeQuote = requestable && settled ? quote : undefined;
  const isPending = currentValid && (!settled || (requestable && isFetching));
  const canContinue =
    Boolean(activeQuote) && !isPending && !balancesLoading && !errors.amount;

  function handleFromChange(code: string) {
    if (code === to) return;
    setValue("from", code, { shouldDirty: true });
  }

  function handleToChange(code: string) {
    if (code === from) return;
    setValue("to", code, { shouldDirty: true });
  }

  function handleSwap() {
    // The new "from" is the old "to", so use the quoted output when we have
    // one, cut to the precision of the currency that is now being spent.
    const base = activeQuote ? activeQuote.toAmount : amount;
    const nextAmount = toCurrency
      ? truncateToDecimals(base, toCurrency.decimals)
      : base;
    setValue("from", to, { shouldDirty: true });
    setValue("to", from, { shouldDirty: true });
    setValue("amount", nextAmount, { shouldDirty: true, shouldValidate: true });
  }

  function handleMax() {
    if (balance === undefined || !fromCurrency) return;
    setValue("amount", truncateToDecimals(balance, fromCurrency.decimals), {
      shouldDirty: true,
    });
    clearErrors();
  }

  const onSubmit = handleSubmit((values) => {
    if (!activeQuote) return;
    onContinue?.(values, activeQuote);
  });

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor={amountId} className="text-sm font-medium">
              You pay
            </label>
            <span className="text-muted-foreground text-sm">
              {balancesLoading
                ? "Loading balance"
                : balance !== undefined
                  ? `Balance: ${formatAmount(balance, from)} ${from}`
                  : "Balance unavailable"}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              id={amountId}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              aria-invalid={errors.amount ? true : undefined}
              aria-describedby={errors.amount ? `${amountId}-error` : undefined}
              className="min-w-0 flex-1 rounded-md border px-3 py-2"
              {...register("amount")}
            />
            <button
              type="button"
              onClick={handleMax}
              disabled={balance === undefined}
              aria-label={`Use maximum ${from} balance`}
              className="rounded-md border px-3 py-2 text-sm"
            >
              Max
            </button>
            <CurrencySelect
              id={fromId}
              label="Currency to convert from"
              value={from}
              onChange={handleFromChange}
              disabledCode={to}
            />
          </div>
          {errors.amount && (
            <p
              id={`${amountId}-error`}
              role="alert"
              className="text-sm text-red-600"
            >
              {errors.amount.message}
            </p>
          )}
        </section>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap from and to currencies"
            className="rounded-full border px-3 py-2"
          >
            <span aria-hidden="true">&#8645;</span>
          </button>
        </div>

        <section className="flex flex-col gap-2">
          <span className="text-sm font-medium">You receive</span>
          <div className="flex gap-2">
            <output
              htmlFor={amountId}
              aria-live="polite"
              aria-busy={isPending}
              className="flex min-h-10 min-w-0 flex-1 items-center rounded-md border px-3 py-2"
            >
              {isPending ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-24 animate-pulse rounded bg-gray-200"
                  />
                  <span className="sr-only">Fetching quote</span>
                </>
              ) : activeQuote ? (
                formatAmount(activeQuote.toAmount, to)
              ) : (
                "0"
              )}
            </output>
            <CurrencySelect
              id={toId}
              label="Currency to convert to"
              value={to}
              onChange={handleToChange}
              disabledCode={from}
            />
          </div>
          {errors.to && (
            <p role="alert" className="text-sm text-red-600">
              {errors.to.message}
            </p>
          )}
        </section>

        {requestable && quoteError && !isPending && (
          <p role="alert" className="text-sm text-red-600">
            We could not get a quote right now. Please try again.
          </p>
        )}

        {activeQuote && !isPending && (
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt>Rate</dt>
            <dd className="text-right">
              {formatRate(activeQuote.rate, from, to)}
            </dd>
            <dt>Fee</dt>
            <dd className="text-right">
              {activeQuote.fee === null
                ? "Shown on your receipt"
                : `${formatAmount(activeQuote.fee, activeQuote.feeCurrency)} ${activeQuote.feeCurrency}`}
            </dd>
          </dl>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-md border px-4 py-2"
          >
            Copy link
          </button>
          <button
            type="submit"
            disabled={!canContinue}
            className="flex-1 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            Review conversion
          </button>
        </div>
      </form>
      <div className="mt-8">
        <RateHistoryChart from={from} to={to} />
      </div>
    </>
  );
}
