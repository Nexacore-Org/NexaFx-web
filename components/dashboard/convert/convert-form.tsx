"use client";

import { useState, useMemo } from "react";
import { ChevronDown, AlertCircle, ArrowDownUp, DollarSign, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyOption {
    id: string;
    name: string;
    symbol: string;
    balance: string;
}

// Mock exchange rates: rate from NGN to each currency
const MOCK_RATES: Record<string, Record<string, number>> = {
    NGN: {
        USD: 1 / 1580,
        EUR: 1 / 1720,
        GBP: 1 / 1980,
        USDC: 1 / 1580,
        ETH: 1 / 65000000,
        NGN: 1,
    },
    USD: {
        NGN: 1580,
        EUR: 0.92,
        GBP: 0.79,
        USDC: 1,
        ETH: 0.026,
        USD: 1,
    },
    EUR: {
        NGN: 1720,
        USD: 1.09,
        GBP: 0.86,
        USDC: 1.09,
        ETH: 0.028,
        EUR: 1,
    },
    GBP: {
        NGN: 1980,
        USD: 1.27,
        EUR: 1.16,
        USDC: 1.27,
        ETH: 0.032,
        GBP: 1,
    },
    USDC: {
        NGN: 1580,
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        ETH: 0.026,
        USDC: 1,
    },
    ETH: {
        NGN: 65000000,
        USD: 39000,
        EUR: 35800,
        GBP: 30800,
        USDC: 39000,
        ETH: 1,
    },
};

// Mock balances (simulated user balances)
const MOCK_BALANCES: Record<string, string> = {
    NGN: "500,000.00",
    USD: "1,250.50",
    EUR: "987.75",
    GBP: "750.00",
    USDC: "2,100.00",
    ETH: "0.50",
};

const CURRENCIES: CurrencyOption[] = [
    { id: "NGN", name: "Nigerian Naira", symbol: "₦", balance: MOCK_BALANCES.NGN },
    { id: "USD", name: "US Dollar", symbol: "$", balance: MOCK_BALANCES.USD },
    { id: "EUR", name: "Euro", symbol: "€", balance: MOCK_BALANCES.EUR },
    { id: "GBP", name: "British Pound", symbol: "£", balance: MOCK_BALANCES.GBP },
    { id: "USDC", name: "USD Coin", symbol: "USDC", balance: MOCK_BALANCES.USDC },
    { id: "ETH", name: "Ethereum", symbol: "ETH", balance: MOCK_BALANCES.ETH },
];

interface ConvertFormProps {
    // can be extended with callbacks later
}

export function ConvertForm({}: ConvertFormProps) {
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("NGN");
    const [amount, setAmount] = useState("");
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [errors, setErrors] = useState<{ amount?: string }>({});

    const fromCurrencyData = CURRENCIES.find(c => c.id === fromCurrency) || CURRENCIES[0];
    const toCurrencyData = CURRENCIES.find(c => c.id === toCurrency) || CURRENCIES[1];

    // Calculate exchange rate and converted amount
    const exchangeRate = useMemo(() => {
        if (!fromCurrency || !toCurrency) return 0;
        return MOCK_RATES[fromCurrency]?.[toCurrency] || 0;
    }, [fromCurrency, toCurrency]);

    const convertedAmount = useMemo(() => {
        if (!amount || isNaN(parseFloat(amount))) return "";
        const numAmount = parseFloat(amount);
        const result = numAmount * exchangeRate;
        return result.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: fromCurrency === "ETH" || toCurrency === "ETH" ? 8 : 2,
        });
    }, [amount, exchangeRate, fromCurrency, toCurrency]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setAmount("");
        setShowFromDropdown(false);
        setShowToDropdown(false);
    };

    const handleMaxClick = () => {
        const balanceStr = fromCurrencyData.balance.replace(/,/g, "");
        setAmount(parseFloat(balanceStr).toString());
        if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "");
        setAmount(value);
        if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
    };

    const validateForm = () => {
        const newErrors: { amount?: string } = {};

        if (!amount.trim()) {
            newErrors.amount = "Amount is required";
        } else {
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                newErrors.amount = "Amount must be greater than 0";
            } else if (numAmount > parseFloat(fromCurrencyData.balance.replace(",", ""))) {
                newErrors.amount = "Insufficient balance";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConvert = () => {
        if (validateForm()) {
            // Backend API will be integrated in future issue
            console.log({
                from: fromCurrency,
                to: toCurrency,
                amount,
                convertedAmount,
            });
        }
    };

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
                                    "hover:bg-muted transition-colors cursor-pointer"
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
                                <ChevronDown className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform",
                                    showFromDropdown && "rotate-180"
                                )} />
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
                                                curr.id === fromCurrency && "bg-primary/10"
                                            )}
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
                                            <span className="text-sm text-muted-foreground">
                                                {curr.balance}
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
                                    Balance: {fromCurrencyData.balance}
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
                            "shadow-sm hover:shadow-md"
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
                                    "hover:bg-muted transition-colors cursor-pointer"
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
                                <ChevronDown className={cn(
                                    "h-5 w-5 text-muted-foreground transition-transform",
                                    showToDropdown && "rotate-180"
                                )} />
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
                                                curr.id === toCurrency && "bg-primary/10"
                                            )}
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
                                            <span className="text-sm text-muted-foreground">
                                                {curr.balance}
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
                {amount && exchangeRate > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/50">
                        <span className="text-sm text-muted-foreground">Exchange Rate</span>
                        <span className="text-sm font-semibold text-foreground">
                            1 {fromCurrency} = {exchangeRate.toLocaleString(undefined, {
                                minimumFractionDigits: fromCurrency === "ETH" || toCurrency === "ETH" ? 2 : 2,
                                maximumFractionDigits: fromCurrency === "ETH" || toCurrency === "ETH" ? 8 : 2,
                            })} {toCurrency}
                        </span>
                    </div>
                )}

                {/* Info Section */}
                <div className="space-y-2 pt-2">
                    <p className="text-xs text-muted-foreground text-center">
                        Exchange rates updated in real-time. Your conversion will be locked at checkout.
                    </p>
                </div>

                {/* Convert Button */}
                <div className="space-y-3">
                    <button
                        type="button"
                        disabled={true}
                        title="Backend API integration coming soon in a future release"
                        className={cn(
                            "w-full py-3.5 rounded-xl font-semibold",
                            "bg-primary text-primary-foreground",
                            "hover:bg-primary/90 active:scale-[0.98]",
                            "transition-all duration-200",
                            "opacity-60 cursor-not-allowed"
                        )}
                    >
                        Convert (Coming Soon)
                    </button>
                    <p className="text-xs text-center text-muted-foreground">
                        Backend API integration pending.
                    </p>
                </div>
            </div>
        </div>
    );
}
