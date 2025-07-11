import { CurrencyOption } from "./currency-dropdown-item";
import { CryptoRate } from "./crypto-rate-card";

export interface MobileAction {
  icon: string;
  label: string;
  alt: string;
}

export const currencyOptions: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", color: "bg-blue-500" },
  { code: "EUR", name: "Euro", color: "bg-blue-600" },
  { code: "GBP", name: "British Pound", color: "bg-red-500" },
  { code: "BTC", name: "Bitcoin", color: "bg-orange-500" },
  { code: "ETH", name: "Ethereum", color: "bg-purple-500" },
];

export const mobileActions: MobileAction[] = [
  { icon: "/deposit.svg", label: "Deposit", alt: "deposit" },
  { icon: "/withdraw.svg", label: "Withdrawal", alt: "withdraw" },
  { icon: "/convert.svg", label: "Convert", alt: "convert" },
];

export const currencyValues: Record<string, string> = {
  USD: "$1,160.52",
  EUR: "€1,045.30",
  GBP: "£920.15",
  BTC: "₿0.012",
  ETH: "Ξ0.45",
};

export const cryptoRates: CryptoRate[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    price: "$150.27",
    change: "+0.01%",
    positive: true,
  },
  {
    symbol: "BNB",
    name: "Binance usd",
    price: "$617.78",
    change: "+0.01%",
    positive: true,
  },
  {
    symbol: "BNB",
    name: "Binance usd",
    price: "$617.78",
    change: "+0.01%",
    positive: true,
  },
  {
    symbol: "BNB",
    name: "Binance usd",
    price: "$617.78",
    change: "+0.01%",
    positive: true,
  },
  {
    symbol: "BNB",
    name: "Binance usd",
    price: "$617.78",
    change: "+0.01%",
    positive: true,
  },
];
