"use client";

import { useState, useEffect } from "react";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { ChevronDown, ChevronLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrencies, type Currency } from "@/lib/api/currencies";
import { getBalances } from "@/lib/api/wallet";

interface CurrencyOption {
    id: string;
    name: string;
    icon: string;
    balance: string;
}

function toCurrencyOption(
    c: Currency,
    balanceMap: Record<string, string>,
): CurrencyOption {
    return {
        id: c.code,
        name: c.name,
        icon: `/icons/${c.code.toLowerCase()}.svg`,
        balance: balanceMap[c.code] ?? "0.00",
    };
}

function balanceToCurrencyOption(
    currency: string,
    balance: string,
): CurrencyOption {
    return {
        id: currency,
        name: currency,
        icon: `/icons/${currency.toLowerCase()}.svg`,
        balance,
    };
}

export function WithdrawalForm() {
    const { currency, amount, walletAddress, setStep, setFormData, close, reset } = useWithdrawalStore();

    const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
    const [currenciesUnavailable, setCurrenciesUnavailable] = useState(false);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [errors, setErrors] = useState<{ address?: string; amount?: string }>({});

    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            setIsLoadingCurrencies(true);
            setCurrenciesUnavailable(false);

            let balanceMap: Record<string, string> = {};

            try {
                const balanceData = await getBalances();
                if (cancelled) return;
                for (const b of balanceData) {
                    balanceMap[b.currency] = b.balance;
                }
            } catch {
                balanceMap = {};
            }

            try {
                const currencyData = await getCurrencies();
                if (cancelled) return;
                setCurrencies(
                    currencyData.map((c) => toCurrencyOption(c, balanceMap)),
                );
                setCurrenciesUnavailable(false);
            } catch {
                if (cancelled) return;
                setCurrenciesUnavailable(true);
                const fallback = Object.entries(balanceMap).map(([code, bal]) =>
                    balanceToCurrencyOption(code, bal),
                );
                setCurrencies(fallback);
                if (fallback.length > 0 && !currency) {
                    setFormData({ currency: fallback[0].id });
                }
            } finally {
                if (!cancelled) setIsLoadingCurrencies(false);
            }
        };
        init();
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedCurrency =
        currencies.find((c) => c.id === currency) || currencies[0];

    const validateForm = () => {
        const newErrors: { address?: string; amount?: string } = {};

        if (!walletAddress.trim()) {
            newErrors.address = "Destination address is required";
        } else if (walletAddress.trim().length < 10) {
            newErrors.address = "Please enter a valid destination address";
        }

        if (!amount.trim()) {
            newErrors.amount = "Amount is required";
        } else if (!selectedCurrency) {
            newErrors.amount = "No currency available";
        } else {
            const numAmount = parseFloat(amount);
            const available = parseFloat(
                selectedCurrency.balance.replace(/,/g, ""),
            );
            if (isNaN(numAmount) || numAmount <= 0) {
                newErrors.amount = "Amount must be greater than 0";
            } else if (numAmount > available) {
                newErrors.amount = "Insufficient balance";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            setStep("review");
        }
    };

    const handleMaxClick = () => {
        if (!selectedCurrency) return;
        setFormData({
            amount: selectedCurrency.balance.replace(/,/g, ""),
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
                    <h2 id="withdrawal-modal-title" className="text-xl font-bold text-foreground">
                        Withdraw to Wallet
                    </h2>
                    <p className="text-sm text-muted-foreground">Enter withdrawal details</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="destination-address" className="text-sm font-medium text-foreground">
                        Destination Address
                    </label>
                    <input
                        id="destination-address"
                        type="text"
                        placeholder="Enter destination wallet address"
                        value={walletAddress}
                        onChange={(e) => {
                            setFormData({ walletAddress: e.target.value });
                            if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                        }}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl bg-muted/50 border",
                            "text-sm text-foreground placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50",
                            "transition-all duration-200",
                            errors.address ? "border-destructive" : "border-border",
                        )}
                    />
                    {errors.address && (
                        <div className="flex items-center gap-1.5 text-destructive" role="alert">
                            <AlertCircle className="size-3.5" aria-hidden="true" />
                            <span className="text-xs">{errors.address}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="withdrawal-currency" className="text-sm font-medium text-foreground">
                        Currency
                    </label>
                    <div className="relative">
                        {currenciesUnavailable ? (
                            <div
                                id="withdrawal-currency"
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 border border-border text-muted-foreground"
                                role="status"
                            >
                                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                                <span className="text-sm">Currencies unavailable</span>
                            </div>
                        ) : (
                            <button
                                id="withdrawal-currency"
                                type="button"
                                disabled={isLoadingCurrencies || currenciesUnavailable}
                                aria-haspopup="listbox"
                                aria-expanded={showCurrencyDropdown}
                                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl",
                                    "bg-muted/50 border border-border",
                                    "hover:bg-muted transition-colors",
                                    isLoadingCurrencies && "opacity-60 cursor-wait",
                                )}
                            >
                                {isLoadingCurrencies ? (
                                    <span className="text-sm text-muted-foreground animate-pulse">
                                        Loading currencies…
                                    </span>
                                ) : selectedCurrency ? (
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-foreground">
                                            {selectedCurrency.id}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {selectedCurrency.name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        No currencies available
                                    </span>
                                )}
                                <ChevronDown
                                    className={cn(
                                        "size-5 text-muted-foreground transition-transform",
                                        showCurrencyDropdown && "rotate-180",
                                    )}
                                    aria-hidden="true"
                                />
                            </button>
                        )}

                        {showCurrencyDropdown && !isLoadingCurrencies && !currenciesUnavailable && (
                            <ul
                                role="listbox"
                                aria-label="Select currency"
                                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10"
                            >
                                {currencies.map((curr) => (
                                    <li key={curr.id} role="option" aria-selected={curr.id === currency}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ currency: curr.id });
                                                setShowCurrencyDropdown(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3",
                                                "hover:bg-muted transition-colors",
                                                curr.id === currency && "bg-primary/10",
                                            )}
                                        >
                                            <div className="flex items-center gap-3 text-left">
                                                <p className="font-medium text-foreground">{curr.id}</p>
                                                <p className="text-xs text-muted-foreground">{curr.name}</p>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {curr.balance}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="withdrawal-amount" className="text-sm font-medium text-foreground">
                            Amount
                        </label>
                        <span className="text-xs text-muted-foreground">
                            Balance: {selectedCurrency?.balance ?? "—"}{" "}
                            {selectedCurrency?.id ?? ""}
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            id="withdrawal-amount"
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, "");
                                setFormData({ amount: value });
                                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                            }}
                            className={cn(
                                "w-full px-4 py-3 pr-16 rounded-xl bg-muted/50 border",
                                "text-sm text-foreground placeholder:text-muted-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "transition-all duration-200",
                                errors.amount ? "border-destructive" : "border-border",
                            )}
                        />
                        <button
                            type="button"
                            onClick={handleMaxClick}
                            disabled={!selectedCurrency}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                            aria-label="Use maximum available balance"
                        >
                            MAX
                        </button>
                    </div>
                    {errors.amount && (
                        <div className="flex items-center gap-1.5 text-destructive" role="alert">
                            <AlertCircle className="size-3.5" aria-hidden="true" />
                            <span className="text-xs">{errors.amount}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoadingCurrencies || currenciesUnavailable || !selectedCurrency}
                    className={cn(
                        "w-full py-3.5 rounded-xl font-semibold",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 active:scale-[0.98]",
                        "transition-all duration-200",
                        (isLoadingCurrencies || currenciesUnavailable || !selectedCurrency) &&
                            "opacity-50 cursor-not-allowed",
                    )}
                >
                    Withdraw
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
