import React from "react";
import { CircleDollarSign, BadgeDollarSign, Coins } from "lucide-react";

export interface CurrencyOption {
  id: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { id: "NGN", name: "Nigerian Naira", symbol: "\u20A6" },
  { id: "USD", name: "US Dollar", symbol: "$" },
  { id: "EUR", name: "Euro", symbol: "\u20AC" },
  { id: "GBP", name: "British Pound", symbol: "\u00A3" },
  { id: "USDC", name: "USD Coin", symbol: "USDC" },
  { id: "ETH", name: "Ethereum", symbol: "ETH" },
  { id: "BNB", name: "BNB", symbol: "BNB" },
];

export const FALLBACK_CURRENCY_CODES = ["NGN", "USD", "EUR", "GBP", "USDC"];

export const WITHDRAWAL_SUCCESS_CURRENCIES = [
  { id: "USDC", name: "USD Coin", icon: React.createElement(CircleDollarSign, { className: "w-8 h-8 text-blue-500" }) },
  { id: "ETH", name: "Ethereum", icon: React.createElement(BadgeDollarSign, { className: "w-8 h-8 text-neutral-500" }) },
  { id: "BNB", name: "BNB", icon: React.createElement(Coins, { className: "w-8 h-8 text-yellow-500" }) },
];
