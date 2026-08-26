"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownUp, RefreshCw, AlertCircle, ChevronDown } from "lucide-react";

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

const FALLBACK_RATE = 1500;

export default function CurrencyConverter() {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromCurrencyData =
    CURRENCIES.find((c) => c.id === fromCurrency) || CURRENCIES[0];
  const toCurrencyData =
    CURRENCIES.find((c) => c.id === toCurrency) || CURRENCIES[1];

  const displayRate = rateError ? FALLBACK_RATE : exchangeRate;

  const convertedAmount = (() => {
    if (!amount || isNaN(parseFloat(amount)) || displayRate === 0) return "";
    const num = parseFloat(amount);
    const result = num * displayRate;
    const maxDecimals =
      fromCurrency === "ETH" || toCurrency === "ETH" ? 8 : 2;
    return result.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimals,
    });
  })();

  const fetchRate = useCallback(
    (from: string, to: string) => {
      setIsLoadingRate(true);
      setRateError(false);

      fetch(`/api/exchange-rates?from=${from}&to=${to}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch rate");
          return res.json();
        })
        .then((data) => {
          if (data.rate) {
            setExchangeRate(Number(data.rate));
          } else {
            setExchangeRate(0);
            setRateError(true);
          }
        })
        .catch(() => {
          setExchangeRate(0);
          setRateError(true);
        })
        .finally(() => {
          setIsLoadingRate(false);
        });
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRate(fromCurrency, toCurrency);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fromCurrency, toCurrency, fetchRate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount("");
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  const handleConvert = () => {
    router.push("/signup");
  };

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-lg p-6 w-full max-w-md mx-auto">
      <div className="space-y-5">
        {/* From */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            From
          </label>
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/50 hover:bg-gray-100 dark:hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#F39A00]/10 flex items-center justify-center font-bold text-xs text-[#F39A00]">
                  {fromCurrencyData.symbol
                    .toUpperCase()
                    .substring(0, 1)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {fromCurrency}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fromCurrencyData.name}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${showFromDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg overflow-hidden z-20">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => {
                      setFromCurrency(curr.id);
                      setShowFromDropdown(false);
                      setAmount("");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors ${
                      curr.id === fromCurrency ? "bg-[#F39A00]/5" : ""
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-[#F39A00]/10 flex items-center justify-center font-bold text-xs text-[#F39A00]">
                      {curr.symbol.toUpperCase().substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {curr.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {curr.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/50">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              className="w-full bg-transparent text-lg font-semibold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="p-3 rounded-full bg-white dark:bg-card border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="h-5 w-5 text-[#F39A00]" />
          </button>
        </div>

        {/* To */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            To
          </label>
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/50 hover:bg-gray-100 dark:hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#F39A00]/10 flex items-center justify-center font-bold text-xs text-[#F39A00]">
                  {toCurrencyData.symbol.toUpperCase().substring(0, 1)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {toCurrency}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {toCurrencyData.name}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${showToDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg overflow-hidden z-20">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.id}
                    type="button"
                    onClick={() => {
                      setToCurrency(curr.id);
                      setShowToDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors ${
                      curr.id === toCurrency ? "bg-[#F39A00]/5" : ""
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-[#F39A00]/10 flex items-center justify-center font-bold text-xs text-[#F39A00]">
                      {curr.symbol.toUpperCase().substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {curr.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {curr.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Converted Result */}
          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/50 flex items-center justify-between min-h-[49px]">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isLoadingRate ? (
                <RefreshCw className="h-5 w-5 animate-spin text-[#F39A00]" />
              ) : convertedAmount ? (
                convertedAmount
              ) : (
                <span className="text-gray-400 dark:text-gray-500 font-normal">
                  0.00
                </span>
              )}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {toCurrency}
            </span>
          </div>
        </div>

        {/* Rate / Error Info */}
        {rateError ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
            <div className="text-sm text-red-600 dark:text-red-400">
              <p className="font-medium">Rates unavailable. Try again later.</p>
              <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                Static example: 1 USD ≈ {FALLBACK_RATE.toLocaleString()} NGN
              </p>
            </div>
          </div>
        ) : exchangeRate > 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            1 {fromCurrency} ≈{" "}
            {exchangeRate.toLocaleString(undefined, {
              maximumFractionDigits:
                fromCurrency === "ETH" || toCurrency === "ETH" ? 8 : 2,
            })}{" "}
            {toCurrency}
          </div>
        ) : null}

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleConvert}
          className="w-full py-3 rounded-xl font-semibold bg-[#F39A00] text-white hover:bg-[#da8a00] active:scale-[0.98] transition-all duration-200"
        >
          Convert
        </button>
      </div>
    </div>
  );
}
