"use client";

import { useEffect, useState } from "react";
import { Copy, X, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction, getTransactionById } from "@/lib/api/transactions";

interface TransactionDetailsProps {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
}

export function TransactionDetails({ transaction, open, onClose }: TransactionDetailsProps) {
    const [detail, setDetail] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (!open || !transaction?.id) {
            setDetail(null);
            return;
        }
        setIsLoading(true);
        getTransactionById(transaction.id)
            .then(setDetail)
            .catch(() => setDetail(transaction))
            .finally(() => setIsLoading(false));
    }, [open, transaction?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!open || !transaction) return null;

    const tx = detail ?? transaction;

    const isDeposit = tx.type === "Deposit";
    const isConvert = tx.type === "Convert";

    let heroLabel = "";
    if (isConvert) heroLabel = `Convert ${tx.currency} to ${tx.toCurrency ?? "USDT"}`;
    else if (isDeposit) heroLabel = `Deposit ${tx.currency}`;
    else heroLabel = `Withdraw ${tx.currency}`;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal/Drawer Content */}
            <div
                className={cn(
                    "relative z-50 w-full bg-background shadow-lg flex flex-col",
                    "md:fixed md:top-1 md:right-4 md:bottom-4 md:w-112.5 md:rounded-xl",
                    "rounded-t-3xl h-[85vh] md:h-auto",
                    "animate-in slide-in-from-bottom duration-300 md:slide-in-from-right md:duration-300"
                )}
            >
                {/* Header */}
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
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : (
                        <>
                            {/* Hero Section */}
                            <div className="bg-[#F2F2F4] rounded p-8 flex flex-col items-center justify-center space-y-4">
                                <div
                                    className={cn(
                                        "h-16 w-16 rounded-full flex items-center justify-center",
                                        isDeposit
                                            ? "bg-green-500/10"
                                            : isConvert
                                            ? "bg-orange-500/10"
                                            : "bg-red-500/10"
                                    )}
                                >
                                    {isConvert ? (
                                        <RefreshCw className="h-8 w-8 text-orange-500" />
                                    ) : isDeposit ? (
                                        <ArrowDownLeft className="h-8 w-8 text-green-500" />
                                    ) : (
                                        <ArrowUpRight className="h-8 w-8 text-red-500" />
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-[#000000]">{heroLabel}</p>
                                    <h2 className="text-2xl md:text-3xl font-bold mt-1 text-foreground">
                                        {tx.amountString}
                                    </h2>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Transaction Details</h3>
                                <div className="space-y-3">
                                    <DetailRow label="Date & Time" value={tx.date} />
                                    <DetailRow label="Type" value={tx.type} />
                                    <DetailRow label="From" value={tx.currency} />
                                    {tx.toCurrency && (
                                        <DetailRow label="To" value={tx.toCurrency} />
                                    )}
                                    {tx.toAmount != null && (
                                        <DetailRow
                                            label="Amount Received"
                                            value={`${tx.toAmount.toLocaleString()} ${tx.toCurrency ?? ""}`}
                                        />
                                    )}
                                    {tx.exchangeRate != null && (
                                        <DetailRow
                                            label="Exchange Rate"
                                            value={String(tx.exchangeRate)}
                                        />
                                    )}
                                    {tx.fee != null && (
                                        <DetailRow
                                            label="Fee"
                                            value={`${tx.fee.toLocaleString()} ${tx.currency}`}
                                        />
                                    )}
                                    <DetailRow label="Status" value={tx.status} />
                                    <DetailRow
                                        label="Reference ID"
                                        value={tx.reference}
                                        isCopyable
                                    />
                                    {tx.description && (
                                        <DetailRow label="Description" value={tx.description} />
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row items-center gap-4 pt-4">
                                <button className="flex-1 bg-[#FFD552] text-primary-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:opacity-90 transition-opacity whitespace-nowrap">
                                    Share Transaction
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-transparent border border-[#000000] text-foreground font-semibold py-2 px-3 text-sm rounded-[18px] hover:bg-muted transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({
    label,
    value,
    isCopyable,
}: {
    label: string;
    value: string;
    isCopyable?: boolean;
}) {
    return (
        <div className="flex justify-between items-start py-1">
            <span className="text-sm text-muted-foreground font-medium">{label}:</span>
            <div className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold text-foreground">{value}</span>
                {isCopyable && (
                    <Copy className="h-3 w-3 text-muted-foreground cursor-pointer" />
                )}
            </div>
        </div>
    );
}
