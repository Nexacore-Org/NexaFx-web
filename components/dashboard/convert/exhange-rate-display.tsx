"use client";

import {
  ChevronDown,
  EqualApproximately,
  Newspaper,
  RefreshCcw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import millify from "millify";

interface ExchangeRateDisplayProps {
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: string;
  fee: string;
}

export function ExchangeRateDisplay({
  fromCurrency,
  toCurrency,
  exchangeRate,
}: // fee,
ExchangeRateDisplayProps) {
  return (
    <div className="flex flex-col items-center font-medium justify-between mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex justify-center items-center gap-4 font-bold">
          <span>1 {fromCurrency}</span>
          <EqualApproximately />
          <div className="flex items-center space-x-1">
            <span>{millify(Number(exchangeRate.replace(",", "")))}</span>
            <span>{toCurrency}</span>
          </div>
        </div>
        <RefreshCcw className="w-3 h-3 text-gray-500" />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-between w-full font-semibold items-center gap-2 mt-5 cursor-help">
              <div className="flex items-center space-x-2 justify-center">
                <Newspaper className="text-[#CD7700] w-4 h-4" />
                <span className="text-gray-700">Transaction Fee:</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <span>{0.2} USDC</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is the cost to process this transaction.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
