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
import { MAX_AMOUNT_INPUT_LENGTH } from "@/lib/constants/limits";

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
  // live maxBalance plugged in, so the two never drift apart.
  const maxBalance = selectedCurrency
    ? parseFloat(selectedCurrency.balance.replace(",", ""))
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
    defaultValues: { walletAddress: "", amount: "" },
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
    !errors.amount;

  const onSubmit = (data: WithdrawalFormValues) => {
    setFormData({ walletAddress: data.walletAddress, amount: data.amount });
    setStep("review");
  };

  const handleMaxClick = () => {
    if (!selectedCurrency) return;
    setValue("amount", selectedCurrency.balance.replace(",", ""), {
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
                  className="text-xs font-semibold text-destructive underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {!isLoadingCurrencies && !currencyError && isEmptyBalance && (
        <div className="space-y-4">
          <div className="px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
            Your balance is empty. Make a deposit first.
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {!isLoadingCurrencies && !currencyError && !isEmptyBalance && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Wallet Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Wallet Address
            </label>
            <Input
              {...register("walletAddress")}
              type="text"
              placeholder="Enter wallet address or username"
              error={errors.walletAddress?.message}
              className={cn(
                "rounded-xl bg-muted/50 border",
                errors.walletAddress ? "border-destructive" : "border-border",
              )}
            />
            {showMemoWarning && (
              <p className="text-xs text-amber-700">
                This address appears to belong to an exchange. You may need to
                include a memo/tag with your transfer. Please check with the
                recipient.
              </p>
            )}
          </div>

          {/* Currency Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Currency
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
              >
                {selectedCurrency ? (
                  <span className="font-medium text-foreground">
                    {selectedCurrency.id}
                  </span>
                ) : null}
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform",
                    showCurrencyDropdown && "rotate-180",
                  )}
                />
              </button>

              {showCurrencyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
                  {currencies.map((curr) => (
                    <button
                      key={curr.id}
                      type="button"
                      onClick={() => {
                        setFormData({ currency: curr.id });
                        setShowCurrencyDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors",
                        curr.id === currency && "bg-primary/10",
                      )}
                    >
                      <div className="text-left">
                        <p className="font-medium text-foreground">{curr.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {curr.name}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {curr.balance}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {usedFallbackCurrencies && (
              <p className="text-xs text-amber-700">
                Currency list is temporarily limited. Contact support if your
                currency is missing.
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Amount
              </label>
              <span className="text-xs text-muted-foreground">
                Balance: {selectedCurrency?.balance ?? "—"}{" "}
                {selectedCurrency?.id ?? ""}
              </span>
            </div>
            <div className="relative">
              <Input
                {...register("amount")}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                maxLength={MAX_AMOUNT_INPUT_LENGTH}
                error={errors.amount?.message}
                className={cn(
                  "pr-16 rounded-xl bg-muted/50 border",
                  errors.amount ? "border-destructive" : "border-border",
                )}
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-3 top-2.5 px-2 py-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Withdrawal Limits */}
          {!limitsLoading &&
            currency &&
            (remainingDaily !== null || remainingMonthly !== null) && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Withdrawal Limits
                </p>
                {remainingDaily !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Daily remaining
                    </span>
                    <span className="font-medium text-foreground">
                      {remainingDaily} {currency}
                    </span>
                  </div>
                )}
                {remainingMonthly !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Monthly remaining
                    </span>
                    <span className="font-medium text-foreground">
                      {remainingMonthly} {currency}
                    </span>
                  </div>
                )}
              </div>
            )}

          <div className="text-center">
            <FeeEstimatorModal />
          </div>

          <div className="space-y-3 pt-2">
            {canSubmit && (
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                Withdraw
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
