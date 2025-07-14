import { CurrencyOption } from "./currency-dropdown-item";
import { CryptoRate } from "./crypto-rate-card";

export interface MobileAction {
  icon: string;
  label: string;
  alt: string;
}

export const currencyOptions: CurrencyOption[] = [
  // { code: "USD", name: "US Dollar", icon: "/usd.svg" },
  { code: "BTC", name: "Bitcoin", icon: "/bnb.svg" },
  { code: "ETH", name: "Ethereum", icon: "/eth.svg" },
];

export const mobileActions: MobileAction[] = [
  { icon: "/deposit.svg", label: "Deposit", alt: "deposit" },
  { icon: "/withdraw.svg", label: "Withdrawal", alt: "withdraw" },
  { icon: "/convert.svg", label: "Convert", alt: "convert" },
];

export const currencyValues: Record<string, string> = {
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
