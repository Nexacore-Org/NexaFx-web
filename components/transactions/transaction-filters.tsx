"use client";

import { Search, SlidersHorizontal } from "lucide-react";
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
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
            {/* Search Input - Desktop full width, mobile full width */}
            <div className="relative w-full md:w-80">
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
            <div className="flex items-center w-full md:w-auto">
                {/* Desktop: Bordered Tabs Container */}
                <div className="hidden md:flex items-center border-[0.25px]  border-[#7B7B7B] rounded-[10px] overflow-hidden bg-white shadow-sm">
                    {filters.map((filter, index) => (
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

                {/* Mobile: Individual Bordered Tabs + Filter Button */}
                <div className="md:hidden flex items-center gap-2 w-full overflow-x-auto pb-2 no-scrollbar">
                    {/* Tabs */}
                    <div className="flex items-center gap-1">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => onFilterChange(filter)}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium rounded-md border transition-colors whitespace-nowrap shrink-0",
                                    activeFilter === filter || (filter === "All" && activeFilter === "All")
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {filter}
                                {filter === "All" && (
                                    <span className={cn(
                                        "ml-1 px-1.5 py-0.5 text-xs rounded",
                                        activeFilter === "All"
                                            ? "bg-primary-foreground/20 text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {totalCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {/* Mobile Filter Button */}
                    <button 
                        className="ml-auto p-2 text-muted-foreground hover:text-foreground border border-border rounded-md shrink-0"
                        aria-label="Filter options"
                    >
                       <SlidersHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}