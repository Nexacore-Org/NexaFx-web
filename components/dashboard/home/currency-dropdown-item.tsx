import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Image from "next/image";

export interface CurrencyOption {
  code: string;
  name: string;
  icon: string; // image path for the currency icon
}

interface CurrencyDropdownItemProps {
  currency: CurrencyOption;
  onClick: () => void;
}

export function CurrencyDropdownItem({
  currency,
  onClick,
}: CurrencyDropdownItemProps) {
  return (
    <DropdownMenuItem onClick={onClick}>
      <div className="flex items-center space-x-2">
        <Image src={currency.icon} alt={currency.code} width={16} height={16} />
        <span>
          {currency.code} - {currency.name}
        </span>
      </div>
    </DropdownMenuItem>
  );
}
