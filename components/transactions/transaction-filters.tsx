"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    totalCount: number;
}

const filters = ["All", "Deposit", "Withdrawal", "Convert"];

export function TransactionFilters({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
    totalCount,
}: TransactionFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-row items-center justify-between gap-2 md:gap-4 py-4">
            {/* Search Input - Desktop w-80, mobile flex-1 */}
            <div className="relative flex-1 md:w-80 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 pl-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            {/* Filters Section */}
            <div className="flex items-center shrink-0 md:w-auto">
                {/* Desktop: Bordered Tabs Container */}
                <div className="hidden md:flex items-center border-[0.25px] border-[#7B7B7B] rounded-[10px] overflow-hidden bg-white shadow-sm">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => onFilterChange(filter)}
                            className={cn(
                                "relative px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-25 text-center",
                                activeFilter === filter || (filter === "All" && activeFilter === "All")
                                    ? "bg-primary text-primary-foreground rounded-[10px]"
                                    : "text-[#00000099]/60 hover:bg-muted/50 hover:text-foreground",
                            )}
                        >
                            {filter}
                            {filter === "All" && (
                                <span className={cn(
                                    "ml-1 px-1.5 py-0.5 text-xs rounded",
                                    activeFilter === "All"
                                        ? " text-primary-foreground"
                                        : " text-muted-foreground"
                                )}>
                                    {totalCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Mobile: Filter Display + Dropdown Trigger */}
                <div className="md:hidden flex items-center gap-2">
                    {/* Active Filter Pill */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-[10px] text-sm font-medium shadow-sm whitespace-nowrap">
                        <span>{activeFilter}</span>
                        <span className="opacity-80 text-xs">{totalCount}</span>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 bg-card text-foreground hover:bg-muted transition-colors  "
                            aria-label="Filter options"
                        >
                           <ListFilter className="h-5 w-5" />
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
                                <div className="py-1">
                                    {filters.map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => {
                                                onFilterChange(filter);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted",
                                                activeFilter === filter ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{filter}</span>
                                                {filter === "All" && <span className="text-xs text-muted-foreground">{totalCount}</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}