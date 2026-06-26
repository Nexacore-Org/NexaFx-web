"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, AlertCircle, ArrowDownUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBalances } from "@/lib/api/wallet";
import { createSwap } from "@/lib/api/transactions";
import { getExchangeRate } from "@/lib/api/exchange-rates";
import { getRequestErrorMessage } from "@/lib/api-client";

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
  const [amount, setAmount] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string }>({});

  const [balances, setBalances] = useState<Record<string, string>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const hadExchangeRateRef = useRef(false);

  const fromCurrencyData =
    CURRENCIES.find((c) => c.id === fromCurrency) || CURRENCIES[0];
  const toCurrencyData =
    CURRENCIES.find((c) => c.id === toCurrency) || CURRENCIES[1];

  useEffect(() => {
    getBalances()
      .then((res) => {
        const newBalances: Record<string, string> = {};
        res.forEach((b) => {
          newBalances[b.currency] = b.balance;
        });
        setBalances(newBalances);
      })
      .catch((err) => {
        console.error("Failed to fetch balances", err);
        setErrors({
          amount: getRequestErrorMessage(err, {
            fallback: "Unable to load balances. Please try again.",
          }),
        });
      });
  }, []);

  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;
    setIsLoadingRate(true);
    setRateError(null);

    getExchangeRate(fromCurrency, toCurrency)
      .then((data) => {
        if (data.rate) {
          hadExchangeRateRef.current = true;
          setExchangeRate(Number(data.rate));
        } else {
          setExchangeRate(0);
          setRateError("Rates unavailable");
        }
      })
      .catch((err) => {
        console.error(err);
        setExchangeRate(0);
        setRateError(
          getRequestErrorMessage(err, {
            fallback: "Rates unavailable",
            hasCachedData: hadExchangeRateRef.current,
          }),
        );
      })
      .finally(() => {
        setIsLoadingRate(false);
      });
  }, [fromCurrency, toCurrency]);

  const convertedAmount = useMemo(() => {
    if (!amount || isNaN(parseFloat(amount)) || exchangeRate === 0) return "";
    const numAmount = parseFloat(amount);
    const result = numAmount * exchangeRate;
    return result.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits:
        fromCurrency === "ETH" || toCurrency === "ETH" ? 8 : 2,
    });
  }, [amount, exchangeRate, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount("");
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  const fromBalanceStr = balances[fromCurrency] || "0.00";
  const handleMaxClick = () => {
    const balanceStr = fromBalanceStr.replace(/,/g, "");
    setAmount(parseFloat(balanceStr).toString());
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setErrors({ amount: "Enter a valid amount" });
      return;
    }
    const balanceNum = parseFloat(fromBalanceStr.replace(/,/g, ""));
    if (parseFloat(amount) > balanceNum) {
      setErrors({ amount: "Insufficient balance" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await createSwap({
        fromCurrency,
        toCurrency,
        amount,
      });
      if (res.status === "failed") {
        setErrors({ amount: res.message || "Swap failed" });
      } else {
        // Success
        setAmount("");
        // Refresh balances
        const bals = await getBalances();
        const newBalances: Record<string, string> = {};
        bals.forEach((b) => {
          newBalances[b.currency] = b.balance;
        });
        setBalances(newBalances);
      }
    } catch (err: unknown) {
      const errorMessage = getRequestErrorMessage(err, {
        fallback: "An error occurred during conversion",
      });
      setErrors({ amount: errorMessage });
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Currency Convert
          </h1>
          <p className="text-sm text-muted-foreground">
            Convert between currencies at current market rates
          </p>
        </div>

        {/* From Section */}
        <div className="space-y-4 bg-card rounded-2xl p-6 border border-border">
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">
              From
            </label>

            {/* Currency Selector */}
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowFromDropdown(!showFromDropdown);
                  setShowToDropdown(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-xl",
                  "bg-muted/50 border border-border",
                  "hover:bg-muted transition-colors cursor-pointer",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                    {fromCurrencyData.symbol.toUpperCase().substring(0, 1)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {fromCurrency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fromCurrencyData.name}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    showFromDropdown && "rotate-180",
                  )}
                />
              </button>

              {/* Dropdown */}
              {showFromDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
                  {CURRENCIES.map((curr) => (
                    <button
                      key={curr.id}
                      type="button"
                      onClick={() => {
                        setFromCurrency(curr.id);
                        setShowFromDropdown(false);
                        setAmount("");
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left",
                        "hover:bg-muted transition-colors",
                        curr.id === fromCurrency && "bg-primary/10",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {curr.symbol.toUpperCase().substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {curr.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {curr.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {balances[curr.id] || "0.00"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Amount
                </label>
                <span className="text-xs text-muted-foreground">
                  Balance: {fromBalanceStr}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className={cn(
                    "w-full px-4 py-3.5 pr-16 rounded-xl bg-muted/50 border",
                    "text-base text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "transition-all duration-200",
                    errors.amount ? "border-destructive" : "border-border",
                  )}
                />
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  MAX
                </button>
              </div>
              {errors.amount && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">{errors.amount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className={cn(
              "p-3 rounded-full bg-card border border-border",
              "hover:bg-muted/50 transition-colors",
              "flex items-center justify-center",
              "shadow-sm hover:shadow-md",
            )}
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* To Section */}
        <div className="space-y-4 bg-card rounded-2xl p-6 border border-border">
          <div>
            <label className="text-sm font-medium text-foreground block mb-3">
              To
            </label>

            {/* Currency Selector */}
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-xl",
                  "bg-muted/50 border border-border",
                  "hover:bg-muted transition-colors cursor-pointer",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                    {toCurrencyData.symbol.toUpperCase().substring(0, 1)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {toCurrency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {toCurrencyData.name}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    showToDropdown && "rotate-180",
                  )}
                />
              </button>

              {/* Dropdown */}
              {showToDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
                  {CURRENCIES.map((curr) => (
                    <button
                      key={curr.id}
                      type="button"
                      onClick={() => {
                        setToCurrency(curr.id);
                        setShowToDropdown(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-left",
                        "hover:bg-muted transition-colors",
                        curr.id === toCurrency && "bg-primary/10",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {curr.symbol.toUpperCase().substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {curr.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {curr.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {balances[curr.id] || "0.00"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Amount
              </label>
              <div className="px-4 py-3.5 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                <span className="text-base text-foreground font-semibold">
                  {convertedAmount || "0.00"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {toCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Preview */}
        <div className="space-y-2">
          {isLoadingRate ? (
            <div className="flex items-center justify-center px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">
                Fetching live rates...
              </span>
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
              <span className="text-sm text-muted-foreground">
                Exchange Rate
              </span>
              <span className="text-sm font-semibold text-foreground">
                1 {fromCurrency} ={" "}
                {exchangeRate.toLocaleString(undefined, {
                  minimumFractionDigits:
                    fromCurrency === "ETH" || toCurrency === "ETH" ? 2 : 2,
                  maximumFractionDigits:
                    fromCurrency === "ETH" || toCurrency === "ETH" ? 8 : 2,
                })}{" "}
                {toCurrency}
              </span>
            </div>
          ) : null}
        </div>

        {/* Info Section */}
        <div className="space-y-2 pt-2">
          <p className="text-xs text-muted-foreground text-center">
            Exchange rates updated in real-time. Your conversion will be locked
            at checkout.
          </p>
        </div>

        {/* Convert Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            title={rateError ? "Rates unavailable" : undefined}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.98]",
              "transition-all duration-200",
              isButtonDisabled &&
                "opacity-60 cursor-not-allowed hover:bg-primary",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert Now"
            )}
          </button>
          {rateError && (
            <p className="text-xs text-center text-destructive">{rateError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
