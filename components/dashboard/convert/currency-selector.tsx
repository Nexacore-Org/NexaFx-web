"use client";

import { ChevronDown, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Currency } from "@/types";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}: CurrencySelectorProps) {
  const [open, setOpen] = useState<boolean>(false);
  const handleOpenChange = () => {
    setOpen(open ? open : !open);
  };
  console.log("isOpened", open);
  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className={`ml-4 flex gap-2 w-[100px]  h-[42px] items-center justify-center shadow-[0px_1px_3px_0px_rgba(0,0,0,0.02),0px_0px_0px_1px_rgba(27,31,35,0.15)] font-semibold text-lg  ${
          variant === "default"
            ? "bg-blue-500 text-lg hover:bg-blue-600 text-white  rounded-full"
            : ""
        } ${className}`}
      >
        {currency}
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onFocusOutside={() => {
          setOpen(false);
        }}
        className="sm:max-w-[611px] h-[223px] px-6  py-3  overflow-hidden mt-1 -ml-64"
      >
        <div className="w-full flex items-center justify-between">
          <div className="text-black font-semibold">Select Token</div>
          <Button
            variant={"ghost"}
            onClick={() => {
              setOpen(false);
            }}
          >
            <X />
          </Button>
        </div>
        <div className="flex flex-col gap-2 py-2">
          <div className="relative py-1">
            <Search className="absolute mt-1 left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or paste address"
              className="pl-10 h-10 bg-bg-input rounded-full"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            {currencies.map((currency: Currency) => (
              <DropdownMenuItem
                key={currency.code}
                onClick={() => {
                  onSelect(currency);
                  setOpen(false);
                }}
                className="flex bg-bg-selector cursor-pointer flex-col items-center px-3 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="w-6 h-6 bg-bg-selector-icon rounded-md flex items-center justify-center">
                  {/* <span className="text-sm font-semibold">{currency.icon}</span> */}
                </div>
                <span className="text-sm font-medium">{currency.code}</span>
              </DropdownMenuItem>
            ))}
          </div>
        </div>
        <div className=" flex gap-2 items-center w-full justify-center ">
          <div className="h-[0.5px] bg-gray-500/30 w-1/2"></div>
          <Button
            className="hover:bg-transparent font-light text-xs p-0"
            variant={"ghost"}
          >
            Show more
          </Button>
          <div className="h-[0.5px]  bg-gray-500/30 w-1/2"></div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
