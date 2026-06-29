"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { ChevronDown, AlertCircle, ArrowDownUp, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { getBalances } from "@/lib/api/wallet";
import { createSwap } from "@/lib/api/transactions";
import { getExchangeRate, lockExchangeRate, type LockedRate } from "@/lib/api/exchange-rates";

import { ChevronDown, AlertCircle, ArrowDownUp, Loader2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBalances } from "@/lib/api/wallet";
import { createSwap } from "@/lib/api/transactions";

import { getRequestErrorMessage } from "@/lib/api-client";
import { EmptyState } from "@/components/shared/empty-state";

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

const convertSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val.replace(/,/g, ""));
      return !isNaN(num) && num > 0;
    }, "Enter a valid amount"),
});

type ConvertFormValues = z.infer<typeof convertSchema>;

export function ConvertForm() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  
  const [step, setStep] = useState<"input" | "confirm">("input");

  const [balances, setBalances] = useState<Record<string, string>>({});
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateRetryCount, setRateRetryCount] = useState(0);
  const hadExchangeRateRef = useRef(false);

  const [lockDetails, setLockDetails] = useState<LockedRate | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLocking, setIsLocking] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ConvertFormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: { amount: "" },
  });

  const amount = watch("amount");

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
        setError("root", {
          message: getRequestErrorMessage(err, { fallback: "Unable to load balances" })
        });
      });

  }, [setError]);

  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;
    
    let active = true;
    
    Promise.resolve().then(() => {
        if (active) {
            setIsLoadingRate(true);
            setRateError(null);
        }
    });
    

  }, []);

    useEffect(() => {
        if (!fromCurrency || !toCurrency) return;
        
        let active = true;
        
        Promise.resolve().then(() => {
            if (active) {
                setIsLoadingRate(true);
                setRateError(null);
            }
        });
        
        fetch(`/api/exchange-rates?from=${fromCurrency}&to=${toCurrency}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch rate");
                return res.json();
            })
            .then(data => {
                if (!active) return;
                if (data.rate) {
                    setExchangeRate(Number(data.rate));
                } else {
                    setExchangeRate(0);
                    setRateError("Rates unavailable");
                }
            })
            .catch(err => {
                if (!active) return;
                console.error(err);
                setExchangeRate(0);
                setRateError("Rates unavailable");
            })
            .finally(() => {
                if (active) {
                    setIsLoadingRate(false);
                }
            });


    getExchangeRate(fromCurrency, toCurrency)
      .then((data) => {
        if (!active) return;
        if (data.rate) {
          hadExchangeRateRef.current = true;
          setExchangeRate(Number(data.rate));
        } else {
          setExchangeRate(0);
          setRateError("Rates unavailable");
        }
      })
      .catch((err) => {
        if (!active) return;
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
        if (active) setIsLoadingRate(false);
      });

      
    return () => { active = false; };
  }, [fromCurrency, toCurrency]);

  }, [fromCurrency, toCurrency, rateRetryCount]);


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

  useEffect(() => {
    if (step !== "confirm" || timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [step, timeLeft]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setValue("amount", "");
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  const fromBalanceStr = balances[fromCurrency] || "0.00";
  const handleMaxClick = () => {
    const balanceStr = fromBalanceStr.replace(/,/g, "");
    setValue("amount", parseFloat(balanceStr).toString(), { shouldValidate: true });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setValue("amount", value, { shouldValidate: true });
  };

  const onPreview = async (data: ConvertFormValues) => {
    const balanceNum = parseFloat(fromBalanceStr.replace(/,/g, ""));
    const amountNum = parseFloat(data.amount);
    if (amountNum > balanceNum) {
      setError("amount", { message: "Insufficient balance" });
      return;
    }
    clearErrors();
    setIsLocking(true);
    
    try {
      const lockRes = await lockExchangeRate(fromCurrency, toCurrency, amountNum);
      setLockDetails(lockRes);
      // Determine seconds until expiry
      const expiry = new Date(lockRes.expiresAt).getTime();
      const now = Date.now();
      let diff = Math.max(0, Math.floor((expiry - now) / 1000));
      if (diff === 0 || isNaN(diff)) diff = 300; // default 5 mins
      setTimeLeft(diff);
      setStep("confirm");
    } catch (err: unknown) {
      console.warn("Backend rate lock not available or failed, using fallback", err);
      // Fallback flow
      setLockDetails(null);
      setTimeLeft(30);
      setStep("confirm");
    } finally {
      setIsLocking(false);
    }
  };

  const onConfirm = async () => {
    clearErrors();
    try {
      const res = await createSwap({
        fromCurrency,
        toCurrency,
        amount,
        lockId: lockDetails?.lockId,
      });
      if (res.status === "failed") {
        setError("root", { message: res.message || "Swap failed" });
        setStep("input");
      } else {
        // Success
        setValue("amount", "");
        setStep("input");
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
      setError("root", { message: errorMessage });
      setStep("input");
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

  if (step === "confirm") {
    const isExpired = timeLeft === 0;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formattedTime = `${mins}:${secs.toString().padStart(2, "0")}`;

    const maxTime = lockDetails ? 300 : 30; // approx max time for progress bar
    const progressPercent = Math.max(0, (timeLeft / maxTime) * 100);

    return (
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {isExpired ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
              <h1 className="text-xl font-bold text-destructive mb-2">Rate Expired</h1>
              <p className="text-sm text-destructive/80 mb-6">
                Your rate has expired. Lock a new rate to continue.
              </p>
              <button
                type="button"
                onClick={() => setStep("input")}
                className="w-full py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get new rate
              </button>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Confirm Conversion</h1>
                <p className="text-sm text-muted-foreground">Please review the details before confirming.</p>
              </div>

              {/* Timer UI */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Rate locked
                  </span>
                  <span className={cn(
                    "text-sm font-bold tabular-nums",
                    timeLeft < 60 ? "text-destructive" : "text-primary"
                  )}>
                    expires in {formattedTime}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000 ease-linear rounded-full",
                      timeLeft < 60 ? "bg-destructive" : "bg-primary"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">You pay</span>
                  <span className="font-semibold text-foreground">{amount} {fromCurrency}</span>
                </div>
                
                <div className="flex justify-center py-2">
                  <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">You receive</span>
                  <span className="font-semibold text-foreground">{lockDetails ? lockDetails.toAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : convertedAmount} {toCurrency}</span>
                </div>
                
                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Exchange Rate</span>
                    <span className="text-sm font-medium text-foreground">
                      1 {fromCurrency} = {lockDetails ? lockDetails.rate : exchangeRate} {toCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {errors.root && (
                <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{errors.root.message}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onConfirm)}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Swap"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      <form onSubmit={handleSubmit(onPreview)} className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Currency Convert
          </h1>
          <p className="text-sm text-muted-foreground">
            Convert between currencies at current market rates
          </p>
        </div>
        
        {errors.root && (
            <div className="flex items-center gap-1.5 text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{errors.root.message}</span>
            </div>
        )}

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
                        setValue("amount", "");
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
                  <span className="text-xs">{errors.amount.message}</span>
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
            <EmptyState
              icon={<BarChart3 className="h-12 w-12" />}
              title="Rates unavailable"
              description="We're having trouble fetching exchange rates. Please try again in a few minutes."
              action={{ label: "Retry", onClick: () => setRateRetryCount((c) => c + 1) }}
            />
          ) : amount && exchangeRate > 0 ? (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
              <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                Exchange Rate
                <InfoIcon
                  content="The spread is the difference between the buy and sell price"
                  size="sm"
                  side="top"
                />
              </span>
              <span className="text-sm font-semibold text-foreground">
                 1 {fromCurrency} ={" "}
                 <InfoIcon tooltip="Exchange rate includes a 0.5% conversion fee" />
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
          <p className="text-xs text-muted-foreground text-center inline-flex items-center justify-center gap-1">
            Exchange rates updated in real-time. Your conversion will be locked
            at checkout.
            <InfoIcon
              content="Slippage may occur during high volatility — the final rate may differ slightly"
              size="sm"
              side="top"
            />
          </p>
        </div>

        {/* Convert Button */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isButtonDisabled || isLocking}
            title={rateError ? "Rates unavailable" : undefined}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.98]",
              "transition-all duration-200",
              (isButtonDisabled || isLocking) &&
                "opacity-60 cursor-not-allowed hover:bg-primary",
            )}
          >
            {isLocking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Lock Rate
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
          {rateError && (
            <p className="text-xs text-center text-destructive">{rateError}</p>
          )}
        </div>
      </form>
    </div>
  );
}

