"use client";

import { ScanText } from "lucide-react";

export function TransactionEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-100 border rounded-lg bg-card">
            <div className="relative">
                <ScanText className="h-16 w-16 text-muted-foreground" />
                {/* Diagonal line to simulate */}
                <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-[120%] h-0.5 bg-foreground rotate-45 transform origin-center translate-y-0.5 -translate-x-1.5" />
                </div>
            </div>
            <p className="text-lg font-medium text-muted-foreground">No recent Transaction</p>
        </div>
    );
}
