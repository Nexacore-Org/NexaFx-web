import {
  BadgeDollarSign,
  Banknote,
  CircleDollarSign,
  Coins,
  Euro,
  PoundSterling,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyIconPreset {
  icon: LucideIcon;
  colorClass: string;
}

const CURRENCY_ICONS: Record<string, CurrencyIconPreset> = {
  USDC: { icon: CircleDollarSign, colorClass: "text-blue-500" },
  USD: { icon: CircleDollarSign, colorClass: "text-blue-500" },
  ETH: { icon: BadgeDollarSign, colorClass: "text-neutral-500" },
  BNB: { icon: Coins, colorClass: "text-yellow-500" },
  NGN: { icon: Banknote, colorClass: "text-green-600" },
  EUR: { icon: Euro, colorClass: "text-blue-500" },
  GBP: { icon: PoundSterling, colorClass: "text-purple-500" },
};

const DEFAULT_CURRENCY_ICON: CurrencyIconPreset = CURRENCY_ICONS.USD;

export function getCurrencyIcon(code?: string | null): React.ReactNode {
  const preset =
    CURRENCY_ICONS[String(code ?? "").toUpperCase()] ?? DEFAULT_CURRENCY_ICON;
  const Icon = preset.icon;
  return <Icon className={cn("size-8", preset.colorClass)} aria-hidden="true" />;
}