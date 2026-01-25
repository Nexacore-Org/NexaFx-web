"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

export function TransactionPagination({ 
    currentPage, 
    totalPages, 
    onPageChange,
    totalItems,
    itemsPerPage
}: PaginationProps) {
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2">
            <p className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalItems} entries
            </p>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-xs font-medium border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                {/* Simplified page numbers for now */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((page) => (
                         <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={cn(
                                "h-7 w-7 flex items-center justify-center text-xs rounded-md transition-colors",
                                currentPage === page 
                                    ? "bg-orange-500 text-white font-bold" 
                                    : "bg-muted/50 hover:bg-muted text-foreground"
                            )}
                        >
                            {page}
                        </button>
                    ))}
                    <span className="text-xs text-muted-foreground px-1">...</span>
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-xs font-medium border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
