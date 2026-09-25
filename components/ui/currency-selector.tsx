"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CurrencySelectorOption {
  id: string;
  name: string;
  symbol?: string;
  icon?: React.ReactNode;
  balance?: string;
}

interface CurrencySelectorProps {
  selectedId: string;
  options: CurrencySelectorOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  showBalance?: boolean;
}

function CurrencyAvatar({ option }: { option: CurrencySelectorOption }) {
  if (option.icon) return <>{option.icon}</>;
  return (
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0">
      {(option.symbol ?? option.id).toUpperCase().substring(0, 1)}
    </div>
  );
}

export function CurrencySelector({
  selectedId,
  options,
  isOpen,
  onToggle,
  onSelect,
  isLoading = false,
  disabled = false,
  showBalance = true,
}: CurrencySelectorProps) {
  const selected = options.find((option) => option.id === selectedId) ?? options[0];

  return (
    <div className="relative">
      {/* Toggle */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer",
          "bg-muted/50 border border-border",
          "hover:bg-muted transition-colors",
          (disabled || isLoading) && "opacity-60 cursor-wait"
        )}
      >
        {isLoading ? (
          <span className="text-sm text-muted-foreground animate-pulse">
            Loading currencies…
          </span>
        ) : selected ? (
          <div className="flex items-center gap-3">
            <CurrencyAvatar option={selected} />
            <div className="text-left">
              <p className="font-semibold text-foreground">{selected.id}</p>
              <p className="text-xs text-muted-foreground">{selected.name}</p>
            </div>
          </div>
        ) : null}
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer",
                "hover:bg-muted transition-colors",
                option.id === selectedId && "bg-primary/10"
              )}
            >
              <div className="flex items-center gap-3">
                <CurrencyAvatar option={option} />
                <div>
                  <p className="font-medium text-foreground">{option.id}</p>
                  <p className="text-xs text-muted-foreground">{option.name}</p>
                </div>
              </div>
              {showBalance ? (
                <span className="text-sm text-muted-foreground">
                  {option.balance ?? "0.00"}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}