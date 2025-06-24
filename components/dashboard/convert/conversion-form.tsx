"use client";

// import type { ConversionData } from "@/types";

import { useConversion } from "@/hooks/useConversion";
import { ConfirmationModal } from "../modals/confirmation-modal";
import { CurrencySelector } from "./currency-selector";
import { ExchangeRateDisplay } from "./exhange-rate-display";
import Image from "next/image";
// import { TokenSelectorModal } from "./modals/token-selector-modal";

// import { useState } from "react";
// import { ProcessingModal } from "./modals/processing-modal";
// import { SuccessModal } from "./modals/success-modal";

// interface ConversionFormProps {
//   data: ConversionData;
//   onAmountChange: (field: "from" | "to", value: string) => void;
//   onCurrencySelect: (type: "from" | "to") => void;
//   onConvert: () => void;
// }

export function ConversionForm() {
  const {
    conversionData,
    // showTokenSelector,
    currencies,
    selectToken,

    handleAmountChange,
    openTokenSelector,
    // closeTokenSelector,
  } = useConversion();

  // const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-[#FFE79C]/30 to-[#A0C3FD]/30 w-full max-w-[900px] rounded-2xl p-5 relative">
        <div className="flex flex-col gap-4 relative ">
          {/* From Section */}
          <div className="">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="text-md text-gray-600 font-medium mb-2 block">
                From
              </label>
              <div className="flex h-[80px] relative items-center justify-between">
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
                  className="text-5xl focus:outline-none placeholder:text-gray-400 font-semibold w-full border-none p-0 bg-transparent"
                  placeholder="0"
                  type="text"
                  inputMode="decimal"
                />
                <CurrencySelector
                  currencies={currencies}
                  onSelect={selectToken}
                  currency={conversionData.fromCurrency}
                  onClick={() => openTokenSelector("from")}
                  className="absolute  right-0 cursor-pointer rounded-lg text-lg"
                />
              </div>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center absolute left-0 right-0 top-[8.5rem]  ">
            <div className="w-10 h-10 bg-gray-200 rounded-full border flex items-center justify-center">
              <Image src={"/convert-arrow.png"} alt="arrow" width={100} height={100} />
            </div>
          </div>

          {/* To Section */}
          <div className="mb-6 ">
            <div className="bg-[#EFEDED] rounded-xl p-4 border border-gray-200">
              <label className="text-md font-medium text-gray-600 mb-2 block">
                You will receive
              </label>
              <div className="flex relative h-[80px]  items-center justify-between">
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
                  className="text-5xl focus:outline-none placeholder:text-gray-400 font-semibold border-none w-full p-0 bg-transparent"
                  placeholder="0"
                  type="text"
                  inputMode="decimal"
                />
                <CurrencySelector
                  onSelect={selectToken}
                  currencies={currencies}
                  currency={conversionData.toCurrency}
                  variant="default"
                  onClick={() => openTokenSelector("to")}
                  className="absolute rounded-lg  cursor-pointer right-0 text-lg"
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
        <ConfirmationModal data={conversionData} />
      </div>

      {/* <TokenSelectorModal
        isOpen={showTokenSelector}
        onClose={closeTokenSelector}
        onSelect={selectToken}
        currencies={currencies}
      /> */}
    </div>
  );
}
