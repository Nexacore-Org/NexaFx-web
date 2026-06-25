"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current filter state from URL
  const currentType = searchParams.get("type") || "All";
  const currentStatus = searchParams.get("status") || "All";
  const currentStartDate = searchParams.get("startDate") || "";
  const currentEndDate = searchParams.get("endDate") || "";

  // Helper to update the query string
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "All") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page to 1 whenever filters change
      if (name !== "page") {
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}?${queryString}`, { scroll: false });
  };

  const handleClearFilters = () => {
    // Keep only the limit parameter if it exists, clear everything else (including page)
    const limit = searchParams.get("limit");
    const params = new URLSearchParams();
    if (limit) params.set("limit", limit);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Reusing Tailwind classes from shadcn/ui generic inputs
  const inputClasses =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end w-full mb-6 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-2 flex-1">
        <label htmlFor="type-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Type
        </label>
        <select
          id="type-select"
          className={inputClasses}
          value={currentType}
          onChange={(e) => handleFilterChange("type", e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdraw">Withdraw</option>
          <option value="Convert">Convert</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <label htmlFor="status-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Status
        </label>
        <select
          id="status-select"
          className={inputClasses}
          value={currentStatus}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <label htmlFor="start-date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Start Date
        </label>
        <input
          type="date"
          id="start-date"
          className={inputClasses}
          value={currentStartDate}
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <label htmlFor="end-date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          End Date
        </label>
        <input
          type="date"
          id="end-date"
          className={inputClasses}
          value={currentEndDate}
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleClearFilters}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-neutral-100 hover:text-neutral-900 h-10 px-4 py-2"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
