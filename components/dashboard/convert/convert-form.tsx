"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, AlertCircle, ArrowDownUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBalances } from "@/lib/api/wallet";
import { createSwap } from "@/lib/api/transactions";
import { convertSchema, type ConvertFormValues } from "@/lib/validations/transactions";
import { Input } from "@/components/ui/Input";

interface CurrencyOption {
  id: string;
  name: string;
  symbol: string;
}

const CURRENCIES: CurrencyOption[] = [
  { id: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { id: "USD", name: "US Dollar", symbol: "$" },
  { id: "EUR", name: "Euro", symbol: "€" },
  { id: "GBP", name: "British Pound", symbol: "£" },
  { id: "USDC", name: "USD Coin", symbol: "USDC" },
  { id: "ETH", name: "Ethereum", symbol: "ETH" },
];

export function ConvertForm() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<ConvertFormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: { amount: "" },
  });

  const amount = watch("amount");

  const fromCurrencyData = CURRENCIES.find((c) => c.id === fromCurrency) || CURRENCIES[0];
  const toCurrencyData = CURRENCIES.find((c) => c.id === toCurrency) || CURRENCIES[1];

  useEffect(() => {
    getBalances()
      .then((res) => {
        const map: Record<string, string> = {};
        res.forEach((b) => { map[b.currency] = b.balance; });
        setBalances(map);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;
    setIsLoadingRate(true);
    setRateError(null);
    fetch(`/api/exchange-rates?from=${fromCurrency}&to=${toCurrency}`)
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch rate"); return res.json(); })
      .then((data) => {
        if (data.rate) { setExchangeRate(Number(data.rate)); }
        else { setExchangeRate(0); setRateError("Rates unavailable"); }
      })
      .catch(() => { setExchangeRate(0); setRateError("Rates unavailable"); })
      .finally(() => setIsLoadingRate(false));
  }, [fromCurrency, toCurrency]);

  const convertedAmount = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount)) || exchangeRate === 0) return "";
    const result = parseFloat(amount) * exchangeRate;
    return result.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: fromCurrency === "ETH" || toCurrency === "ETH" ? 8 : 2,
    });
  }, [amount, exchangeRate, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setValue("amount", "");
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  const fromBalanceStr = balances[fromCurrency] || "0.00";

  const handleMaxClick = () => {
    setValue("amount", parseFloat(fromBalanceStr.replace(/,/g, "")).toString(), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: ConvertFormValues) => {
    const balanceNum = parseFloat(fromBalanceStr.replace(/,/g, ""));
    if (parseFloat(data.amount) > balanceNum) {
      setError("amount", { message: "Insufficient balance" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createSwap({ fromCurrency, toCurrency, amount: data.amount });
      if (res.status === "failed") {
        setError("amount", { message: res.message || "Swap failed" });
      } else {
        reset({ amount: "" });
        const bals = await getBalances();
        const map: Record<string, string> = {};
        bals.forEach((b) => { map[b.currency] = b.balance; });
        setBalances(map);
      }
    } catch (err: unknown) {
      setError("amount", {
        message: err instanceof Error ? err.message : "An error occurred during conversion",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled =
    !amount ||
    isNaN(parseFloat(amount)) ||
    parseFloat(amount) <= 0 ||
    exchangeRate === 0 ||
    !!rateError ||
    isLoadingRate ||
    isSubmitting;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Currency Convert</h1>
          <p className="text-sm text-muted-foreground">
            Convert between currencies at current market rates
          </p>
        </div>

        {/* From Section */}
        <div className="space-y-4 bg-card rounded-2xl p-6 border border-border">
          <label className="text-sm font-medium text-foreground block mb-3">From</label>

          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-xl",
                "bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                  {fromCurrencyData.symbol.toUpperCase().substring(0, 1)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{fromCurrency}</p>
                  <p className="text-xs text-muted-foreground">{fromCurrencyData.name}</p>
                </div>
              </div>
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showFromDropdown && "rotate-180")} />
            </button>

            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => { setFromCurrency(curr.id); setShowFromDropdown(false); setValue("amount", ""); }}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors", curr.id === fromCurrency && "bg-primary/10")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                        {curr.symbol.toUpperCase().substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{curr.id}</p>
                        <p className="text-xs text-muted-foreground">{curr.name}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{balances[curr.id] || "0.00"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Amount</label>
              <span className="text-xs text-muted-foreground">Balance: {fromBalanceStr}</span>
            </div>
            <div className="relative">
              <Input
                {...register("amount")}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                error={errors.amount?.message}
                className={cn(
                  "pr-16 rounded-xl bg-muted/50 border text-base",
                  errors.amount ? "border-destructive" : "border-border"
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
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className={cn(
              "p-3 rounded-full bg-card border border-border hover:bg-muted/50 transition-colors",
              "flex items-center justify-center shadow-sm hover:shadow-md"
            )}
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* To Section */}
        <div className="space-y-4 bg-card rounded-2xl p-6 border border-border">
          <label className="text-sm font-medium text-foreground block mb-3">To</label>

          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-xl",
                "bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                  {toCurrencyData.symbol.toUpperCase().substring(0, 1)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{toCurrency}</p>
                  <p className="text-xs text-muted-foreground">{toCurrencyData.name}</p>
                </div>
              </div>
              <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showToDropdown && "rotate-180")} />
            </button>

            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => { setToCurrency(curr.id); setShowToDropdown(false); }}
                    className={cn("w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted transition-colors", curr.id === toCurrency && "bg-primary/10")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                        {curr.symbol.toUpperCase().substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{curr.id}</p>
                        <p className="text-xs text-muted-foreground">{curr.name}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{balances[curr.id] || "0.00"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amount</label>
            <div className="px-4 py-3.5 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
              <span className="text-base text-foreground font-semibold">{convertedAmount || "0.00"}</span>
              <span className="text-sm text-muted-foreground">{toCurrency}</span>
            </div>
          </div>
        </div>

        {/* Rate Preview */}
        <div className="space-y-2">
          {isLoadingRate ? (
            <div className="flex items-center justify-center px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Fetching live rates...</span>
            </div>
          ) : rateError ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <span className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {rateError}
              </span>
            </div>
          ) : amount && exchangeRate > 0 ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
              <span className="text-sm text-muted-foreground">Exchange Rate</span>
              <span className="text-sm font-semibold text-foreground">
                1 {fromCurrency} ={" "}
                {exchangeRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}{" "}
                {toCurrency}
              </span>
            </div>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Exchange rates updated in real-time. Your conversion will be locked at checkout.
        </p>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={isButtonDisabled}
            title={rateError ? "Rates unavailable" : undefined}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200",
              isButtonDisabled && "opacity-60 cursor-not-allowed hover:bg-primary"
            )}
          >
            {isSubmitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Converting...</>
            ) : (
              "Convert Now"
            )}
          </button>
          {rateError && (
            <p className="text-xs text-center text-destructive">
              Unable to fetch exchange rates. Please try again later.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
