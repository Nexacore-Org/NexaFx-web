"use client";

import { Receipt } from "lucide-react";

export function TransactionEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Receipt className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No transactions found</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        No transactions match your current filters. Try adjusting your search criteria or date range.
      </p>
    </div>
  );
}