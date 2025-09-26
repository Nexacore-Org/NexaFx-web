"use client";

import { useState, useCallback } from "react";
import type { ConversionState, ConversionData, Currency } from "@/types/index";

export const currencies: Currency[] = [
  { code: "NGN", name: "Nigerian Naira", icon: "₦", price: 1 },
  { code: "USDC", name: "USD Coin", icon: "$", price: 1600 },
  { code: "USDT", name: "Tether", icon: "₮", price: 1600 },
  { code: "BNB", name: "Binance Coin", icon: "BNB", price: 800 },
  { code: "ETH", name: "Ethereum", icon: "Ξ", price: 3200000 },
];

export const currencyImages: Record<string, string> = {
  USDC: "/usdc.svg",
  USDT: "/usdt.svg",
  BNB: "/bnb.svg",
  ETH: "/eth.svg",
};
// type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "NGN" | "BTC" | "ETH";
// type PriceMap = Record<CurrencyCode, Record<CurrencyCode, number>>;

// // Mock data - In production, this would come from an API
// const MOCK_PRICES: PriceMap = {
//   // Fiat currencies
//   USD: {
//     USD: 1,
//     EUR: 0.85,
//     GBP: 0.73,
//     JPY: 110.0,
//     NGN: 1300.0, // Added NGN rate
//     BTC: 0.000023,
//     ETH: 0.00042,
//   },
//   EUR: {
//     USD: 1.18,
//     EUR: 1,
//     GBP: 0.86,
//     JPY: 129.0,
//     NGN: 1520.0, // Added NGN rate
//     BTC: 0.000027,
//     ETH: 0.00049,
//   },
//   GBP: {
//     USD: 1.37,
//     EUR: 1.16,
//     GBP: 1,
//     JPY: 150.0,
//     NGN: 1780.0, // Added NGN rate
//     BTC: 0.000031,
//     ETH: 0.00057,
//   },
//   JPY: {
//     USD: 0.0091,
//     EUR: 0.0077,
//     GBP: 0.0067,
//     JPY: 1,
//     NGN: 11.8, // Added NGN rate
//     BTC: 0.00000021,
//     ETH: 0.0000038,
//   },
//   NGN: {
//     // Added NGN conversions
//     USD: 0.00077,
//     EUR: 0.00066,
//     GBP: 0.00056,
//     JPY: 0.085,
//     NGN: 1,
//     BTC: 0.000000017,
//     ETH: 0.00000032,
//   },

//   // Crypto currencies
//   BTC: {
//     USD: 43000,
//     EUR: 37000,
//     GBP: 32000,
//     JPY: 4300000,
//     NGN: 55900000, // Added NGN rate
//     BTC: 1,
//     ETH: 18.5,
//   },
//   ETH: {
//     USD: 2300,
//     EUR: 2000,
//     GBP: 1700,
//     JPY: 230000,
//     NGN: 2990000, // Added NGN rate
//     BTC: 0.054,
//     ETH: 1,
//   },
// };

export function useConversion() {
  const [conversionData, setConversionData] = useState<ConversionData>({
    fromAmount: "",
    toAmount: "",
    fromCurrency: "NGN",
    toCurrency: "USDC",
    exchangeRate: "1",
    fee: "0",
  });

  const [conversionState, setConversionState] =
    useState<ConversionState>("idle");
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<"from" | "to">("from");

  console.log(selectorType);
  // Static prices in USD
  const TOKEN_PRICES = {
    NGN: 0.00065, // 1 NGN = $0.00065
    USDC: 1, // 1 USDC = $1
    USDT: 1, // 1 USDT = $1
    BNB: 800, // 1 BNB = $800
    ETH: 3500, // 1 ETH = $3,500
  };

  const handleAmountChange = useCallback(
    (field: "from" | "to", value: string) => {
      // Remove all non-numeric characters except decimal point
      const numericValue = value.replace(/[^\d.]/g, "");

      // Ensure only one decimal point
      const parts = numericValue.split(".");
      const cleanValue = parts[0] + (parts.length > 1 ? "." + parts[1] : "");

      const amount = parseFloat(cleanValue) || 0;
      const fromPrice =
        TOKEN_PRICES[conversionData.fromCurrency as keyof typeof TOKEN_PRICES];
      const toPrice =
        TOKEN_PRICES[conversionData.toCurrency as keyof typeof TOKEN_PRICES];

      if (field === "from") {
        const convertedAmount = (amount * fromPrice) / toPrice;
        setConversionData((prev) => ({
          ...prev,
          fromAmount: value, // Keep the formatted input value
          toAmount: convertedAmount.toLocaleString(undefined, {
            maximumFractionDigits: 6,
            minimumFractionDigits: 0,
          }),
          exchangeRate: (fromPrice / toPrice).toFixed(8),
        }));
      } else {
        const convertedAmount = (amount * toPrice) / fromPrice;
        setConversionData((prev) => ({
          ...prev,
          fromAmount: convertedAmount.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          }),
          toAmount: value, // Keep the formatted input value
          exchangeRate: (fromPrice / toPrice).toFixed(2),
        }));
      }
    },
    [conversionData.fromCurrency, conversionData.toCurrency]
  );

  const handleCurrencySelect = useCallback(
    (type: "from" | "to", currency: string) => {
      setConversionData((prev) => {
        const newData = {
          ...prev,
          [type === "from" ? "fromCurrency" : "toCurrency"]: currency,
        };

        const fromPrice =
          TOKEN_PRICES[newData.fromCurrency as keyof typeof TOKEN_PRICES];
        const toPrice =
          TOKEN_PRICES[newData.toCurrency as keyof typeof TOKEN_PRICES];

        // Parse the formatted number back to a float
        const fromAmount =
          parseFloat(prev.fromAmount.replace(/[^\d.]/g, "")) || 0;

        return {
          ...newData,
          toAmount: ((fromAmount * fromPrice) / toPrice).toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
              minimumFractionDigits: 0,
            }
          ),
          exchangeRate: (fromPrice / toPrice).toFixed(2),
        };
      });
    },
    []
  );

  const selectToken = (currency: Currency) => {
    handleCurrencySelect(selectorType, currency.code);
    setShowTokenSelector(false);
  };

  const updateAmount = (field: "from" | "to", value: string) => {
    setConversionData((prev) => ({
      ...prev,
      [`${field}Amount`]: value,
    }));
  };

  const openTokenSelector = (type: "from" | "to") => {
    setSelectorType(type);
    setShowTokenSelector(true);
  };

  const closeTokenSelector = () => {
    setShowTokenSelector(false);
  };

  const startConversion = () => {
    setConversionState("confirming");
  };

  const proceedConversion = useCallback(() => {
    setConversionState("processing");
    const timer = setTimeout(() => {
      setConversionState("success");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const cancelConversion = useCallback(() => {
    setConversionState("idle");
  }, []);

  const closeConversion = useCallback(() => {
    setConversionState("idle");
  }, []);

  const viewWallet = useCallback(() => {
    setConversionState("idle");
    // Add your wallet navigation logic here
  }, []);

  console.log(conversionState);

  return {
    selectorType,
    conversionData,
    conversionState,
    showTokenSelector,
    updateAmount,
    openTokenSelector,
    setConversionState,
    closeTokenSelector,
    selectToken,
    currencies,
    startConversion,
    proceedConversion,
    cancelConversion,
    closeConversion,
    viewWallet,
    handleAmountChange,
    handleCurrencySelect,
  };
}
