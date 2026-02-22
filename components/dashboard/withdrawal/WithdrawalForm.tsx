"use client";

import { useState, useEffect } from "react";
import { useWithdrawalStore } from "@/hooks/useWithdrawalStore";
import { ChevronDown, ChevronLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrencies, type Currency } from "@/lib/api/currencies";

interface CurrencyOption {
    id: string;
    name: string;
    icon: string;
    balance: string;
}

function toCurrencyOption(c: Currency): CurrencyOption {
    return {
        id: c.code,
        name: c.name,
        icon: `/icons/${c.code.toLowerCase()}.svg`,
        balance: "0.00",
    };
}

export function WithdrawalForm() {
    const { currency, amount, walletAddress, setStep, setFormData } = useWithdrawalStore();

    const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
    const [currencyError, setCurrencyError] = useState<string | null>(null);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [errors, setErrors] = useState<{ address?: string; amount?: string }>({});

    useEffect(() => {
        getCurrencies()
            .then((data) => {
                setCurrencies(data.map(toCurrencyOption));
            })
            .catch(() => {
                setCurrencyError("Unable to load currencies. Please try again.");
            })
            .finally(() => setIsLoadingCurrencies(false));
    }, []);

    const selectedCurrency = currencies.find(c => c.id === currency) || currencies[0];

    const validateForm = () => {
        const newErrors: { address?: string; amount?: string } = {};

        if (!walletAddress.trim()) {
            newErrors.address = "Wallet address is required";
        } else if (walletAddress.trim().length < 10) {
            newErrors.address = "Please enter a valid wallet address";
        }

        if (!amount.trim()) {
            newErrors.amount = "Amount is required";
        } else {
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                newErrors.amount = "Amount must be greater than 0";
            } else if (numAmount > parseFloat(selectedCurrency.balance.replace(",", ""))) {
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
        setFormData({ amount: selectedCurrency.balance.replace(",", "") });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pt-4">
                <button
                    onClick={() => setStep("select")}
                    className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
                >
                    <ChevronLeft className="size-5 text-muted-foreground" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Withdraw to Wallet</h2>
                    <p className="text-sm text-muted-foreground">Enter withdrawal details</p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {/* Wallet Address */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Wallet Address
                    </label>
                    <input
                        type="text"
                        placeholder="Enter wallet address or username"
                        value={walletAddress}
                        onChange={(e) => {
                            setFormData({ walletAddress: e.target.value });
                            if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                        }}
                        className={cn(
                            "w-full px-4 py-3 rounded-xl bg-muted/50 border",
                            "text-sm text-foreground placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50",
                            "transition-all duration-200",
                            errors.address ? "border-destructive" : "border-border"
                        )}
                    />
                    {errors.address && (
                        <div className="flex items-center gap-1.5 text-destructive">
                            <AlertCircle className="size-3.5" />
                            <span className="text-xs">{errors.address}</span>
                        </div>
                    )}
                </div>

                {/* Currency Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Currency
                    </label>
                    <div className="relative">
                        {currencyError ? (
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-destructive/10 border border-destructive">
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span className="text-sm">{currencyError}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrencyError(null);
                                        setIsLoadingCurrencies(true);
                                        getCurrencies()
                                            .then((data) => setCurrencies(data.map(toCurrencyOption)))
                                            .catch(() => setCurrencyError("Unable to load currencies. Please try again."))
                                            .finally(() => setIsLoadingCurrencies(false));
                                    }}
                                    className="text-xs font-semibold text-destructive underline underline-offset-2 hover:opacity-70 transition-opacity shrink-0"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                        <button
                            type="button"
                            disabled={isLoadingCurrencies}
                            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl",
                                "bg-muted/50 border border-border",
                                "hover:bg-muted transition-colors",
                                isLoadingCurrencies && "opacity-60 cursor-wait"
                            )}
                        >
                            {isLoadingCurrencies ? (
                                <span className="text-sm text-muted-foreground animate-pulse">
                                    Loading currencies…
                                </span>
                            ) : selectedCurrency ? (
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedCurrency.icon}
                                        alt={selectedCurrency.name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className="font-medium text-foreground">
                                        {selectedCurrency.id}
                                    </span>
                                </div>
                            ) : null}
                            <ChevronDown className={cn(
                                "size-5 text-muted-foreground transition-transform",
                                showCurrencyDropdown && "rotate-180"
                            )} />
                        </button>
                        )}

                        {/* Dropdown */}
                        {showCurrencyDropdown && !isLoadingCurrencies && !currencyError && (
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
                                            "w-full flex items-center justify-between px-4 py-3",
                                            "hover:bg-muted transition-colors",
                                            curr.id === currency && "bg-primary/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={curr.icon}
                                                alt={curr.name}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <div className="text-left">
                                                <p className="font-medium text-foreground">{curr.id}</p>
                                                <p className="text-xs text-muted-foreground">{curr.name}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {curr.balance}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                            Amount
                        </label>
                        <span className="text-xs text-muted-foreground">
                            Balance: {selectedCurrency?.balance ?? "—"} {selectedCurrency?.id ?? ""}
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, "");
                                setFormData({ amount: value });
                                if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
                            }}
                            className={cn(
                                "w-full px-4 py-3 pr-16 rounded-xl bg-muted/50 border",
                                "text-sm text-foreground placeholder:text-muted-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "transition-all duration-200",
                                errors.amount ? "border-destructive" : "border-border"
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
                            <AlertCircle className="size-3.5" />
                            <span className="text-xs">{errors.amount}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
                <button
                    onClick={handleSubmit}
                    className={cn(
                        "w-full py-3.5 rounded-xl font-semibold",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90 active:scale-[0.98]",
                        "transition-all duration-200"
                    )}
                >
                    Withdraw
                </button>
                <button
                    onClick={() => setStep("select")}
                    className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
