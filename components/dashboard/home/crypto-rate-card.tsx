import React from "react";
import Image from "next/image";

export interface CryptoRate {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}

interface CryptoRateCardProps {
  crypto: CryptoRate;
}

export function CryptoRateCard({ crypto }: CryptoRateCardProps) {
  const renderIcon = () => {
    switch (crypto.symbol) {
      case "ETH":
        return <Image src="/eth.svg" alt="ETH" width={37} height={36} />;
      case "BNB":
        return <Image src="/bnb.svg" alt="BNB" width={37} height={36} />;
      default:
        return (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
            B
          </div>
        );
    }
  };

  return (
    <div className="flex px-2 md:px-5 h-28 py-4 min-w-[168px] md:min-w-[250px] flex-col justify-between items-start rounded-lg border-[0.027rem] border-border-crypto-card bg-bg-glass-medium shadow-[4px_4px_12px_0px_rgba(0,0,0,0.10)] backdrop-blur-[7.5px]">
      <div className="md:flex flex gap-4 justify-center md:justify-between flex-row-reverse items-start w-full">
        <div className="flex flex-col gap-2">
          <div className="text-text-crypto-symbol text-[0.875rem] font-semibold leading-[100%] tracking-[0.28px]">
            {crypto.symbol}
          </div>
          <div className="text-text-crypto-name text-[0.625rem] font-medium leading-[100%] tracking-[0.1px]">
            {crypto.name}
          </div>
        </div>
        <div className="w-fit h-fit rounded-full flex items-center justify-center">
          {renderIcon()}
        </div>
      </div>
      <div className="flex items-end md:justify-between justify-center gap-2 w-full">
        <div className="text-text-crypto-price text-[1rem] font-bold leading-[100%] tracking-[0.48px]">
          {crypto.price}
        </div>
        <div
          className={`text-[0.75rem] font-semibold leading-[100%] ${
            crypto.positive ? "text-text-success" : "text-red-600"
          }`}
        >
          {crypto.change}
        </div>
      </div>
    </div>
  );
}
