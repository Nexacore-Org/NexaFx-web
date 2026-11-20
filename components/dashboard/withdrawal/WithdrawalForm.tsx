"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FeeEstimatorModal } from "@/components/shared/fee-estimator-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWithdrawalStore } from "@/hooks/use-withdrawal-store";
import { ChevronDown, ChevronLeft, AlertCircle } from "lucide-react";
import { useWithdrawalLimits } from "@/hooks/use-withdrawal-limits";
import { cn } from "@/lib/utils";
import { getCurrencies, type Currency } from "@/lib/api/currencies";
import { getBalances } from "@/lib/api/wallet";
import {
  createWithdrawalSchema,
  type WithdrawalFormValues,
} from "@/lib/validations/transactions";
import { Input } from "@/components/ui/Input";
import { requiresMemo } from "@/lib/utils/stellar-validation";
import { parseBalanceAmount } from "@/lib/utils/balance";
import { MAX_AMOUNT_INPUT_LENGTH } from "@/lib/constants/limits";
import { BeneficiarySelector } from "@/components/beneficiaries/BeneficiarySelector";
import type { Beneficiary } from "@/lib/api/beneficiaries";

interface CurrencyOption {
  id: string;
  name: string;
  balance: string;
}

function toCurrencyOption(
  c: Currency,
  balanceMap: Record<string, string>,
): CurrencyOption {
  return { id: c.code, name: c.name, balance: balanceMap[c.code] ?? "0.00" };
}

// GET /currencies currently returns 500 (backend bug) — fall back to this
// static list so the dropdown is never empty for users.
// TODO: remove FALLBACK_CURRENCIES once the backend /currencies 500 is fixed.
const FALLBACK_CURRENCIES = ["NGN", "USD", "EUR", "GBP", "USDC"];

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

export function WithdrawalForm() {
  const { currency, setStep, setFormData, close, reset } = useWithdrawalStore();

  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [usedFallbackCurrencies, setUsedFallbackCurrencies] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const selectedCurrency =
    currencies.find((c) => c.id === currency) || currencies[0];

  // Recomputed whenever the selected currency's balance changes, so the
  // resolver always validates "amount" against the currently-selected
  // balance -- this is the same schema used at submit time, just with a
  // live maxBalance plugged in, so the two never drift apart. parseBalanceAmount
  // strips every thousands separator so large balances aren't truncated.
  const maxBalance = selectedCurrency
    ? parseBalanceAmount(selectedCurrency.balance)
    : undefined;
  const withdrawalSchema = useMemo(
    () => createWithdrawalSchema(maxBalance),
    [maxBalance],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    mode: "onChange",
    defaultValues: { walletAddress: "", amount: "", memo: "" },
  });

  const fetchCurrenciesAndBalances = useCallback(async () => {
    setIsLoadingCurrencies(true);
    setCurrencyError(null);
    setUsedFallbackCurrencies(false);

    // Balances are the real blocker — if they fail we can't safely show amounts.
    const balanceMap: Record<string, string> = {};
    try {
      const balanceData = await getBalances();
      for (const b of balanceData) balanceMap[b.currency] = b.balance;
    } catch {
      setCurrencyError(
        "Unable to load your balances. Please refresh the page.",
      );
      setIsLoadingCurrencies(false);
      return;
    }

    // GET /currencies currently 500s — degrade gracefully to a fallback list
    // instead of leaving the dropdown empty.
    try {
      const currencyData = await getCurrencies();
      setCurrencies(currencyData.map((c) => toCurrencyOption(c, balanceMap)));
    } catch (error) {
      console.error("[NexaFx] GET /currencies failed:", error);
      setCurrencies(
        FALLBACK_CURRENCIES.map((code) => ({
          id: code,
          name: code,
          balance: balanceMap[code] ?? "0.00",
        })),
      );
      setUsedFallbackCurrencies(true);
    } finally {
      setIsLoadingCurrencies(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrenciesAndBalances();
  }, [fetchCurrenciesAndBalances]);

  const {
    remainingDaily,
    remainingMonthly,
    isLoading: limitsLoading,
  } = useWithdrawalLimits(currency);
  const walletAddress = watch("walletAddress");
  const amount = watch("amount");
  const memo = watch("memo");
  const showMemoWarning = requiresMemo(walletAddress ?? "");

  const hasBalanceData =
    !isLoadingCurrencies && !currencyError && currencies.length > 0;
  const hasAnyPositiveBalance = currencies.some(
    (c) => parseFloat(c.balance.replace(",", "")) > 0,
  );
  const isEmptyBalance = hasBalanceData && !hasAnyPositiveBalance;
  const canSubmit = hasBalanceData && !isEmptyBalance;

  // Same rules that gate submit also gate the button's enabled state, so
  // there's no window where the button looks clickable but submit would
  // just bounce straight back with an error.
  const isFormValid =
    Boolean(walletAddress) &&
    Boolean(amount) &&
    !errors.walletAddress &&
    !errors.amount &&
    !errors.memo;

  const onSubmit = (data: WithdrawalFormValues) => {
    setFormData({
      walletAddress: data.walletAddress,
      amount: data.amount,
      memo: data.memo,
    });
    setStep("review");
  };

  const handleBeneficiarySelect = (b: Beneficiary) => {
    setValue("walletAddress", b.address, { shouldValidate: true });
    setValue("memo", b.memo ?? "", { shouldValidate: true });
  };

  const handleMaxClick = () => {
    if (!selectedCurrency) return;
    setValue("amount", selectedCurrency.balance.replace(/,/g, ""), {
      shouldValidate: true,
    });
  };

  const handleCancel = () => {
    close();
    setTimeout(() => reset(), 300);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => setStep("select")}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Back to withdrawal method"
        >
          <ChevronLeft className="size-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Withdraw to Wallet
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter withdrawal details
          </p>
        </div>
      </div>

      {isLoadingCurrencies && (
        <div className="space-y-4" data-testid="withdrawal-skeleton">
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="h-11 w-full" />
          </div>
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-20" />
            <SkeletonBar className="h-11 w-full" />
          </div>
          <div className="space-y-2">
            <SkeletonBar className="h-4 w-16" />
            <SkeletonBar className="h-11 w-full" />
          </div>
          <SkeletonBar className="h-12 w-full mt-4" />
        </div>
      )}

      {!isLoadingCurrencies && currencyError && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive">
            <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
            <div className="flex-1 space-y-2">
              <span className="text-sm text-destructive">{currencyError}</span>
              <div>
                <button
                  type="button"
                  onClick={fetchCurrenciesAndBalances}
                  className="text-sm font-medium text-primary hover:underline"
                  className="text-sm font-medium text-destructive underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoadingCurrencies && !currencyError && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {usedFallbackCurrencies && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/40">
              <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                Live currency list is unavailable — showing a default set.
              </span>
            </div>
          )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Currency
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-background text-left"
                aria-haspopup="listbox"
                aria-expanded={showCurrencyDropdown}
              >
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {selectedCurrency?.id ?? "Select currency"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Balance: {selectedCurrency?.balance ?? "0.00"}
                  </span>
              >
                <span className="text-foreground">
                  {selectedCurrency?.id ?? "Select currency"}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
              {showCurrencyDropdown && (
                <ul
                  role="listbox"
                  className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-border bg-background shadow-lg"
                >
                  {currencies.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={c.id === selectedCurrency?.id}
                        onClick={() => {
                          setValue("amount", "");
                          setShowCurrencyDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-muted"
                      >
                        <span className="text-sm text-foreground">{c.id}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.balance}
                        </span>
                      </button>
                    </li>
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-background shadow-lg">
                  {currencies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setShowCurrencyDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-muted"
                    >
                      {c.id}
                    </button>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="walletAddress"
              className="text-sm font-medium text-foreground"
            >
              Wallet Address
            </label>
            <Input
              id="walletAddress"
              placeholder="Enter Stellar wallet address"
              {...register("walletAddress")}
            />
            {errors.walletAddress && (
              <p className="text-sm text-destructive">
                {errors.walletAddress.message}
            <label className="text-sm font-medium text-foreground">
              Wallet Address
            </label>
            <Input
              {...register("walletAddress")}
              placeholder="G..."
              error={errors.walletAddress?.message}
            />
            <BeneficiarySelector onSelect={handleBeneficiarySelect} />
            {showMemoWarning && !memo && (
              <p className="text-xs text-amber-600">
                This address may require a memo. Add one to avoid lost funds.
              </p>
            )}
            <BeneficiarySelector onSelect={handleBeneficiarySelect} />
          </div>

          {showMemoWarning && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/40">
              <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <span className="text-sm text-amber-700 dark:text-amber-400">
                This address requires a memo. Withdrawals without a memo may be
                lost.
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-foreground"
              >
                Amount
              </label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs font-medium text-primary hover:underline"
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Memo</label>
            <Input
              {...register("memo")}
              placeholder="Optional memo"
              error={errors.memo?.message}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Amount
            </label>
            <div className="relative">
              <Input
                {...register("amount")}
                placeholder="0.00"
                maxLength={MAX_AMOUNT_INPUT_LENGTH}
                error={errors.amount?.message}
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary"
              >
                Max
              </button>
            </div>
            <Input
              id="amount"
              inputMode="decimal"
              maxLength={MAX_AMOUNT_INPUT_LENGTH}
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {!limitsLoading && (remainingDaily || remainingMonthly) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {remainingDaily && (
                <p>Remaining daily limit: {remainingDaily}</p>
              )}
              {remainingMonthly && (
                <p>Remaining monthly limit: {remainingMonthly}</p>
              )}
            </div>
          )}

          {isEmptyBalance && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive">
              <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
              <span className="text-sm text-destructive">
                You have no available balance to withdraw.
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || !isFormValid}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </form>
      )}

      <FeeEstimatorModal />
    </div>
  );
}
