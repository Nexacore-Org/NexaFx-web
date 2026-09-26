"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "dashboard" | "admin";

export interface TransactionFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    totalCount: number;
    dateFrom?: string;
    dateTo?: string;
    onDateFromChange?: (date: string) => void;
    onDateToChange?: (date: string) => void;
    onClearDateRange?: () => void;
    onExportCSV?: () => void;
    variant?: Variant;
}

const filters = ["All", "Deposit", "Withdrawal", "Convert"];

const variantStyles: Record<Variant, {
    searchIcon: string;
    searchInput: string;
    filterContainer: string;
    filterButton: (active: boolean) => string;
    filterCount: (active: boolean) => string;
    activePill: string;
    dropdownTrigger: string;
    dropdown: string;
    dropdownItem: (active: boolean) => string;
    dropdownCount: string;
}> = {
    dashboard: {
        searchIcon: "text-muted-foreground",
        searchInput: "flex h-10 w-full rounded-md border border-input bg-background px-3 pl-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        filterContainer: "hidden md:flex items-center border border-border rounded-[10px] overflow-hidden bg-card shadow-sm",
        filterButton: (active) => cn(
            "relative px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-25 text-center",
            active
                ? "bg-primary text-primary-foreground rounded-[10px]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        ),
        filterCount: (active) => cn(
            "ml-1 px-1.5 py-0.5 text-xs rounded",
            active ? "text-primary-foreground" : "text-muted-foreground",
        ),
        activePill: "flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-[10px] text-sm font-medium shadow-sm whitespace-nowrap",
        dropdownTrigger: "p-2 bg-muted text-foreground hover:bg-muted/80 transition-colors rounded-md",
        dropdown: "absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden",
        dropdownItem: (active) => cn(
            "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted",
            active ? "bg-primary/10 text-primary font-medium" : "text-foreground",
        ),
        dropdownCount: "text-xs text-muted-foreground",
    },
    admin: {
        searchIcon: "text-gray-400",
        searchInput: "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 pl-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-450",
        filterContainer: "hidden md:flex items-center border border-gray-200 rounded-[10px] overflow-hidden bg-white shadow-sm",
        filterButton: (active) => cn(
            "relative px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap min-w-25 text-center",
            active
                ? "bg-yellow-400 text-gray-950 rounded-[10px]"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-950",
        ),
        filterCount: () => "ml-1 px-1.5 py-0.5 text-xs rounded",
        activePill: "flex items-center gap-2 px-3 py-2 bg-yellow-400 text-gray-950 rounded-[10px] text-sm font-medium shadow-sm whitespace-nowrap",
        dropdownTrigger: "p-2 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors rounded-md",
        dropdown: "absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden",
        dropdownItem: (active) => cn(
            "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50",
            active ? "bg-yellow-50 text-yellow-600 font-medium" : "text-gray-950",
        ),
        dropdownCount: "text-xs text-gray-500",
    },
};

export function TransactionFilters({
    searchQuery,
    onSearchChange,
    activeFilter,
    onFilterChange,
    totalCount,
    variant = "dashboard",
}: TransactionFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const styles = variantStyles[variant];

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
                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", styles.searchIcon)} />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Filters Section */}
            <div className="flex items-center shrink-0 md:w-auto">
                {/* Desktop: Bordered Tabs Container */}
                <div className={styles.filterContainer}>
                    {filters.map((filter) => {
                        const isActive = activeFilter === filter || (filter === "All" && activeFilter === "All");
                        return (
                            <button
                                key={filter}
                                onClick={() => onFilterChange(filter)}
                                className={styles.filterButton(isActive)}
                            >
                                {filter}
                                {filter === "All" && (
                                    <span className={styles.filterCount(isActive)}>
                                        {totalCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Mobile: Filter Display + Dropdown Trigger */}
                <div className="md:hidden flex items-center gap-2">
                    {/* Active Filter Pill */}
                    <div className={styles.activePill}>
                        <span>{activeFilter}</span>
                        <span className="opacity-80 text-xs">{totalCount}</span>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className={styles.dropdownTrigger}
                            aria-label="Filter options"
                        >
                           <ListFilter className="h-5 w-5" />
                        </button>

                        {isOpen && (
                            <div className={styles.dropdown}>
                                <div className="py-1">
                                    {filters.map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => {
                                                onFilterChange(filter);
                                                setIsOpen(false);
                                            }}
                                            className={styles.dropdownItem(activeFilter === filter)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{filter}</span>
                                                {filter === "All" && <span className={styles.dropdownCount}>{totalCount}</span>}
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