import type { ReactNode } from "react";
import { CircleDollarSign, BadgeDollarSign, Coins } from "lucide-react";

export interface WithdrawalSuccessCurrency {
  id: string;
  name: string;
  icon: ReactNode;
}

export const WITHDRAWAL_SUCCESS_CURRENCIES: WithdrawalSuccessCurrency[] = [
  { id: "USDC", name: "USD Coin", icon: <CircleDollarSign className="w-8 h-8 text-blue-500" /> },
  { id: "ETH", name: "Ethereum", icon: <BadgeDollarSign className="w-8 h-8 text-neutral-500" /> },
  { id: "BNB", name: "BNB", icon: <Coins className="w-8 h-8 text-yellow-500" /> },
];
