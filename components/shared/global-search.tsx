"use client";

import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
} from "react";
import {
  Search,
  Loader2,
  FileBox,
  Navigation,
  ArrowRightLeft,
  History,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Transaction } from "@/lib/types";
import { apiClient } from "@/lib/api-client";

interface GlobalSearchProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const CURRENCY_CODES = ["USD", "EUR", "NGN", "GBP", "CAD", "AUD", "JPY"];

export function GlobalSearch({ isOpen, setIsOpen }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<{
    from: string;
    to: string;
    rate: number;
  } | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const storedRecents = localStorage.getItem("recentSearches");
    if (storedRecents) {
      setRecentSearches(JSON.parse(storedRecents));
    }
  }, []);

  const addRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) return;
    setRecentSearches((prev) => {
      const newRecents = [
        searchQuery,
        ...prev.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(newRecents));
      return newRecents;
    });
  }, []);

  const pageResults = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Convert Currency", path: "/dashboard/convert" },
    { label: "Deposit Funds", path: "/dashboard/deposit" },
    { label: "Withdraw Funds", path: "/dashboard/withdraw" },
    { label: "Transactions History", path: "/dashboard/transactions" },
    { label: "Settings & Profile", path: "/dashboard/settings" },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  const allResults = [
    ...(!query && recentSearches.length > 0 ? recentSearches : []),
    ...(query ? pageResults : []),
    ...(query ? transactions : []),
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allResults.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : allResults.length - 1,
        );
      } else if (e.key === "Enter" && selectedIndex !== -1) {
        e.preventDefault();
        const selectedItem = allResults[selectedIndex];
        if (typeof selectedItem === "string") {
          setQuery(selectedItem);
        } else if ("path" in selectedItem) {
          handleSelect(selectedItem.path);
        } else if ("id" in selectedItem) {
          handleSelect(`/transactions?id=${selectedItem.id}`);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setIsOpen, selectedIndex, allResults]);

  useEffect(() => {
    if (selectedIndex !== -1 && resultsRef.current[selectedIndex]) {
      resultsRef.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    const upperQuery = debouncedQuery.toUpperCase();
    if (CURRENCY_CODES.includes(upperQuery)) {
      setLoading(true);
      addRecentSearch(debouncedQuery);
      apiClient
        .get(`/exchange-rates?base=${upperQuery}`)
        .then((response) => {
          setExchangeRate({
            from: upperQuery,
            to: "NGN",
            rate: response.data.rates.NGN,
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setExchangeRate(null);
    }

    if (debouncedQuery.length > 1) {
      setLoading(true);
      addRecentSearch(debouncedQuery);
      apiClient
        .get(`/transactions?search=${debouncedQuery}`)
        .then((response) => {
          setTransactions(response.data.slice(0, 5));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setTransactions([]);
    }
  }, [debouncedQuery, addRecentSearch]);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const hasResults =
    pageResults.length > 0 || transactions.length > 0 || !!exchangeRate;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center border-b border-border px-4 py-3 gap-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for pages, transactions, or currency rates..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
          />
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        <div ref={scrollRef} className="max-h-[400px] overflow-y-auto p-2">
          {!query && recentSearches.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between px-4 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  Recent
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recent, i) => (
                <button
                  key={i}
                  ref={(el) => (resultsRef.current[i] = el)}
                  data-selected={selectedIndex === i}
                  onClick={() => setQuery(recent)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors text-left data-[selected=true]:bg-muted"
                >
                  <History className="h-4 w-4 text-muted-foreground" />
                  {recent}
                </button>
              ))}
            </div>
          )}
          {!hasResults && !loading && query ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </p>
          ) : (
            query && (
              <>
                {exchangeRate && (
                  <div className="mb-2">
                    <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                      Currency Rate
                    </h3>
                    <div className="px-4 py-3 text-sm text-foreground bg-muted rounded-xl flex items-center gap-3">
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      1 {exchangeRate.from} = {exchangeRate.rate.toFixed(2)}{" "}
                      {exchangeRate.to}
                    </div>
                  </div>
                )}
                {pageResults.length > 0 && (
                  <div className="mb-2">
                    <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                      Pages
                    </h3>
                    {pageResults.map((result, i) => (
                      <button
                        key={i}
                        ref={(el) =>
                          (resultsRef.current[recentSearches.length + i] = el)
                        }
                        data-selected={
                          selectedIndex === recentSearches.length + i
                        }
                        onClick={() => handleSelect(result.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors text-left data-[selected=true]:bg-muted"
                      >
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        {result.label}
                      </button>
                    ))}
                  </div>
                )}
                {transactions.length > 0 && (
                  <div>
                    <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                      Transactions
                    </h3>
                    {transactions.map((txn, i) => (
                      <button
                        key={txn.id}
                        ref={(el) =>
                          (resultsRef.current[
                            recentSearches.length + pageResults.length + i
                          ] = el)
                        }
                        data-selected={
                          selectedIndex ===
                          recentSearches.length + pageResults.length + i
                        }
                        onClick={() =>
                          handleSelect(`/transactions?id=${txn.id}`)
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted rounded-xl transition-colors text-left data-[selected=true]:bg-muted"
                      >
                        <FileBox className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{txn.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">{txn.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {txn.currency}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}
