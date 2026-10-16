"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBeneficiaries,
  BENEFICIARIES_ENABLED,
  type Beneficiary,
} from "@/lib/api/beneficiaries";

interface BeneficiarySelectorProps {
  /** Called when the user picks a beneficiary. */
  onSelect: (beneficiary: Beneficiary) => void;
  /** The currently-selected currency — used to filter the list. */
  currency?: string;
  /** Disable the selector (e.g. while the form is submitting). */
  disabled?: boolean;
}

/**
 * A dropdown that lists saved beneficiaries and fills the withdrawal form
 * when one is selected.
 *
 * Rendered only when `BENEFICIARIES_ENABLED` is `true`. Returns `null`
 * otherwise so the withdrawal form layout is not affected.
 */
export function BeneficiarySelector({
  onSelect,
  currency,
  disabled = false,
}: BeneficiarySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getBeneficiaries();
      setBeneficiaries(list);
    } catch {
      setError("Unable to load saved recipients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!BENEFICIARIES_ENABLED) return null;

  const filtered = beneficiaries.filter((b) => {
    const matchesCurrency = !currency || b.currency === currency;
    const matchesQuery =
      !query ||
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.address.toLowerCase().includes(query.toLowerCase());
    return matchesCurrency && matchesQuery;
  });

  const handleSelect = (b: Beneficiary) => {
    onSelect(b);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center justify-between gap-2",
          "px-3 py-2.5 rounded-xl border border-border bg-muted/30",
          "text-sm text-muted-foreground",
          "hover:border-primary/50 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <div className="flex items-center gap-2">
          <Users className="size-4" />
          <span>Choose saved recipient</span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Saved recipients"
          className={cn(
            "absolute z-50 left-0 right-0 mt-1",
            "bg-popover border border-border rounded-xl shadow-lg",
            "max-h-72 overflow-auto",
          )}
        >
          {/* Search */}
          <div className="sticky top-0 p-2 bg-popover border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipients…"
                autoFocus
                className={cn(
                  "w-full pl-8 pr-8 py-1.5 text-sm",
                  "bg-background border border-border rounded-lg",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-destructive">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {beneficiaries.length === 0
                ? "No saved recipients yet"
                : "No matches"}
            </div>
          ) : (
            filtered.map((b) => (
              <button
                key={b.id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(b)}
                className={cn(
                  "w-full text-left px-4 py-3",
                  "hover:bg-muted/50 transition-colors",
                  "border-b border-border last:border-b-0",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {b.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      {b.address.slice(0, 12)}…{b.address.slice(-6)}
                    </p>
                    {b.memo && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Memo: {b.memo}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                    {b.currency}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
