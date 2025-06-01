"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface CurrencySelectorProps {
  currency: string;
  variant?: "outline" | "default";
  onClick: () => void;
  className?: string;
}

export function CurrencySelector({
  currency,
  variant = "outline",
  onClick,
  className,
}: CurrencySelectorProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={`ml-4 ${
        variant === "default"
          ? "bg-blue-500 text-lg hover:bg-blue-600 rounded-full"
          : ""
      } ${className}`}
    >
      {currency}
      <ChevronDown className="w-12 h-6 ml-2" />
    </Button>
  );
}
