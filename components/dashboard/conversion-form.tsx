"use client";

import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
// import type { ConversionData } from "@/types";
import { CurrencySelector } from "./currency-selector";
import { ExchangeRateDisplay } from "./exhange-rate-display";
import { useConversion } from "@/hooks/useConversion";
import { TokenSelectorModal } from "./modals/token-selector-modal";
import { ConfirmationModal } from "./modals/confirmation-modal";
import { useState } from "react";
import { ProcessingModal } from "./modals/processing-modal";
import { SuccessModal } from "./modals/success-modal";

// interface ConversionFormProps {
//   data: ConversionData;
//   onAmountChange: (field: "from" | "to", value: string) => void;
//   onCurrencySelect: (type: "from" | "to") => void;
//   onConvert: () => void;
// }

export function ConversionForm() {
  const {
    conversionData,
    conversionState,
    showTokenSelector,
    currencies,
    selectToken,
    proceedConversion,
    cancelConversion,
    closeConversion,
    viewWallet,
    handleAmountChange,
    openTokenSelector,
    closeTokenSelector,
  } = useConversion();

  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-[#FFE79C]/50 to-[#A0C3FD]/50 w-full max-w-[737px] rounded-2xl p-8 relative">
        <div className="flex flex-col gap-4 relative ">
          {/* From Section */}
          <div className="">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="text-md text-gray-600 font-medium mb-2 block">
                From
              </label>
              <div className="flex h-[100px] relative items-center justify-between">
                <input
                  value={conversionData.fromAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Remove any non-numeric characters except decimal point
                    const numericValue = value.replace(/[^\d.]/g, "");
                    // Ensure only one decimal point
                    const parts = numericValue.split(".");
                    const formattedValue =
                      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                      (parts.length > 1 ? "." + parts[1] : "");
                    handleAmountChange("from", formattedValue);
                  }}
                  className="text-5xl focus:outline-none placeholder:text-gray-400 font-semibold w-full p-2 border-none p-0 bg-transparent"
                  placeholder="0"
                  type="text"
                  inputMode="decimal"
                />
                <CurrencySelector
                  currency={conversionData.fromCurrency}
                  onClick={() => openTokenSelector("from")}
                  className="absolute px-12 py-4 right-0 cursor-pointer rounded-lg text-lg"
                />
              </div>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center absolute left-0 right-0 top-[9.8rem]  ">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <ArrowDown className="w-6 h-6 text-gray-600" />
            </div>
          </div>

          {/* To Section */}
          <div className="mb-6 ">
            <div className="bg-[#EFEDED] rounded-xl p-4 border border-gray-200">
              <label className="text-md font-medium text-gray-600 mb-2 block">
                You will receive
              </label>
              <div className="flex relative h-[100px]  items-center justify-between">
                <input
                  value={conversionData.toAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Remove any non-numeric characters except decimal point
                    const numericValue = value.replace(/[^\d.]/g, "");
                    // Ensure only one decimal point
                    const parts = numericValue.split(".");
                    const formattedValue =
                      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                      (parts.length > 1 ? "." + parts[1] : "");
                    handleAmountChange("to", formattedValue);
                  }}
                  className="text-5xl focus:outline-none placeholder:text-gray-400 p-2 font-semibold border-none w-full p-0 bg-transparent"
                  placeholder="0"
                  type="text"
                  inputMode="decimal"
                />
                <CurrencySelector
                  currency={conversionData.toCurrency}
                  variant="default"
                  onClick={() => openTokenSelector("to")}
                  className="absolute rounded-lg px-12 py-4 cursor-pointer right-0 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        <ExchangeRateDisplay
          fromCurrency={conversionData.fromCurrency}
          toCurrency={conversionData.toCurrency}
          exchangeRate={conversionData.exchangeRate}
          fee={conversionData.fee}
        />

        {/* Convert Button */}
        <Button
          onClick={() => setShowConfirmation(true)}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black rounded-sm font-semibold h-[76px] text-xl rounded-xl"
        >
          Convert
        </Button>
      </div>

      <TokenSelectorModal
        isOpen={showTokenSelector}
        onClose={closeTokenSelector}
        onSelect={selectToken}
        currencies={currencies}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onCancel={() => setShowConfirmation(false)}
        data={conversionData}
        onProceed={proceedConversion}
      />
      <ProcessingModal
        isOpen={conversionState === "processing"}
        data={conversionData}
        onCancel={cancelConversion}
      />

      <SuccessModal
        isOpen={conversionState === "success"}
        data={conversionData}
        onClose={closeConversion}
        onViewWallet={viewWallet}
      />
    </div>
  );
}
