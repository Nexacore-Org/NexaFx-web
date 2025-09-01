"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { currencyImages } from "@/hooks/useConversion";
import { Currency } from "@/types";

interface CurrencySelectorProps {
  currency: string;
  variant?: "outline" | "default";
  onClick: () => void;
  className?: string;
  currencies: Currency[];
  onSelect: (currency: Currency) => void;
}

export function CurrencySelector({
  currency,
  variant = "outline",
  className,
  currencies,
  onSelect,
  onClick,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    onClick();
    setOpen((prev) => !prev);
    if (!open) setShowMore(false); // reset on reopen
  };

  return (
    <div className="relative self-start" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`ml-4 flex gap-2 w-30 py-3 items-center justify-center font-semibold text-lg rounded-full ${
          variant === "default" ? "bg-[#F9FAF9]" : "bg-[#E5E5E5]"
        } ${className}`}
      >
        {currencyImages[currency] && (
          <Image
            src={currencyImages[currency]}
            alt={currency}
            width={24}
            height={24}
          />
        )}
        <span>{currency}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="max-sm:fixed max-sm:inset-x-0 max-sm:mx-auto w-[95vw] md:absolute md:right-0 md:-top-20 z-50 mt-2 md:max-w-md md:w-[90vw] bg-white rounded-xl shadow-lg border border-gray-200 px-2 md:px-6 py-3">
          {/* Header */}
          <div className="w-full flex items-center justify-between">
            <div className="text-black font-semibold">Select Token</div>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X />
            </Button>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-2 py-2">
            <div className="relative py-1">
              <Search className="absolute left-3 top-4 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or paste address"
                className="pl-10 h-10 bg-bg-input rounded-full"
              />
            </div>

            {/* Currency Grid */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {currencies.map((currency: Currency) => (
                <div
                  key={currency.code}
                  onClick={() => {
                    onSelect(currency);
                    setOpen(false);
                  }}
                  className="flex bg-bg-selector cursor-pointer flex-col items-center px-3 md:px-5 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors space-y-2"
                >
                  <div className="w-6 h-6 bg-bg-selector-icon rounded-md flex items-center justify-center">
                    {currencyImages[currency.code] && (
                      <Image
                        src={currencyImages[currency.code]}
                        alt={currency.code}
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium">{currency.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider + Show More */}
          <div className="flex gap-2 items-center w-full justify-center">
            <div className="h-[0.5px] bg-gray-500/30 w-1/2"></div>
            <Button
              className="hover:bg-transparent font-light text-xs p-0"
              variant="ghost"
              onClick={() => setShowMore((prev) => !prev)}
            >
              {showMore ? "Show less" : "Show more"}
            </Button>
            <div className="h-[0.5px] bg-gray-500/30 w-1/2"></div>
          </div>

          {/* Extra Content with Transition */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showMore ? "max-h-44 mt-3" : "max-h-0"
            }`}
          >
            <div className="space-y-2 divide-y divide-gray-400">
              {currencies
                .filter((el) => el.code !== "USDC" && el.code !== "NGN")
                .map((currency: Currency) => (
                  <div
                    className="flex justify-between items-center py-2"
                    key={currency.code}
                  >
                    <div className="flex items-center space-x-2">
                      {currencyImages[currency.code] && (
                        <Image
                          src={currencyImages[currency.code]}
                          alt={currency.code}
                          width={26}
                          height={26}
                        />
                      )}
                      <div className="flex flex-col leading-tight">
                        <p className="text-sm font-semibold">{currency.code}</p>
                        <p className="text-xs text-gray-500">{currency.name}</p>
                      </div>
                    </div>
                    <div className="font-semibold">
                      <span>0.0000</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay (mobile only, optional) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
