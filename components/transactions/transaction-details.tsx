"use client";

import { useEffect, useState } from "react";
import { Copy, Share, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/lib/mock-data";

interface TransactionDetailsProps {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
}

export function TransactionDetails({ transaction, open, onClose }: TransactionDetailsProps) {
    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!open || !transaction) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal/Drawer Content */}
            <div className={cn(
                "relative z-50 w-full bg-background shadow-lg flex flex-col",
                "md:fixed md:top-1 md:right-4 md:bottom-4 md:w-112.5 md:rounded-xl",
                "rounded-t-3xl h-[85vh] md:h-auto", 
                "animate-in slide-in-from-bottom duration-300 md:slide-in-from-right md:duration-300"
            )}>
                {/* Header Row (Close Button) */}
                <div className="flex-none flex items-center justify-between p-6 border-b border-border/10 md:border-none">
                    <h2 className="text-xl font-bold md:hidden">Transaction Details</h2>
                    <button 
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-muted transition-colors ml-auto"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 md:pt-6 space-y-6">
                    
                    {/* Hero Section */}
                    <div className="bg-[#F2F2F4] rounded p-8 flex flex-col items-center justify-center space-y-4">
                         <div className="h-16 w-16 rounded-full bg-linear-to-t from-[#F4CECE] to-transparent flex items-center justify-center">
                            <Share className="h-8 w-8 text-[#CC1C1C] rotate-90" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-[#000000]">
                                Convert <span className="font-bold">{transaction.currency}</span> to <span className="font-bold">{transaction.toCurrency || "USDT"}</span>
                            </p>
                            <h2 className="text-2xl md:text-3xl font-bold mt-1 text-foreground">
                                -100,000 NGN
                            </h2>
                        </div>
                    </div>

                    {/* Details List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Transaction Details</h3>
                        
                        <div className="space-y-3">
                            <DetailRow label="Date & Time" value="May 31, 2025 — 2:14 PM" />
                            <DetailRow label="From" value="NGN (Naria)" />
                            <DetailRow label="Amount Converted" value="N100,000" />
                            <DetailRow label="To" value="USDT (Tether)" />
                            <DetailRow label="Amount Received" value="$86.32" />
                            <DetailRow label="Exchange Rate" value="N1,158 = $1" />
                            <DetailRow label="Fee" value="N2,000 (2%)" />
                            <DetailRow label="Reference ID" value={transaction.reference} />
                            <DetailRow 
                                label="Wallet Address" 
                                value="0xAbc...123 (View on Explorer)" 
                                isCopyable 
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row items-center gap-4 pt-4">
                        <button className="flex-1 bg-[#FFD552] text-primary-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:opacity-90 transition-opacity whitespace-nowrap">
                            Share Transaction
                        </button>
                        <button 
                            onClick={onClose}
                            className="flex-1 bg-transparent border border-[#000000]  text-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:bg-muted transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, isCopyable }: { label: string, value: string, isCopyable?: boolean }) {
    return (
        <div className="flex justify-between items-start py-1">
            <span className="text-sm text-muted-foreground font-medium">{label}:</span>
            <div className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold text-foreground">{value}</span>
                {isCopyable && <Copy className="h-3 w-3 text-muted-foreground cursor-pointer" />}
            </div>
        </div>
    );
}
