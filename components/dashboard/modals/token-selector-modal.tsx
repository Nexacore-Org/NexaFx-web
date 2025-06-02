"use client";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import type { Currency } from "@/types";

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  currencies: Currency[];
}

export function TokenSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currencies,
}: TokenSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute  left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or paste address"
              className="pl-10 h-10 bg-[#E5E5E5] rounded-full"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => onSelect(currency)}
                className="flex bg-[#EBEBEB] cursor-pointer flex-col items-center px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="w-8 h-8 bg-[#B7B7B799] rounded-md flex items-center justify-center mb-2">
                  {/* <span className="text-sm font-semibold">{currency.icon}</span> */}
                </div>
                <span className="text-sm font-medium">{currency.code}</span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
