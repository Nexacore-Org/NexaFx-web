import { useState, useRef } from "react";
import { X, Copy, Check, ExternalLink, Wallet, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/lib/api/transactions";
import { useFocusTrap } from "@/hooks/use-focus-trap";

interface TransactionDetailModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(isOpen, onClose, modalRef);

  const handleCopy = (text: string, type: 'address' | 'txId') => {
    navigator.clipboard.writeText(text);
    setCopied(type === 'address' ? true : copied);
    setCopiedTxId(type === 'txId' ? true : copiedTxId);
    setTimeout(() => {
      if (type === 'address') {
        setCopied(false);
      } else {
        setCopiedTxId(false);
      }
    }, 2000);
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "Failed":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Success":
        return <Check className="h-3 w-3" />;
      case "Pending":
        return null;
      case "Failed":
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Deposit":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "Withdraw":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "Convert":
        return "bg-orange-500/10 text-orange-600 border-orange-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Deposit":
        return <Wallet className="h-4 w-4" />;
      case "Withdraw":
        return <RefreshCw className="h-4 w-4" />;
      case "Convert":
        return <ExternalLink className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getWalletAddress = () => {
    if (transaction.description?.includes("wallet")) {
      return transaction.description.split(":")[1]?.trim() || transaction.description;
    }
    return transaction.reference || "N/A";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-card text-card-foreground rounded-xl p-6 shadow-2xl border border-border/50 w-full max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Transaction Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm break-all">
                    {transaction.reference || transaction.id}
                  </p>
                  <button
                    onClick={() => handleCopy(transaction.reference || transaction.id, 'txId')}
                    className="p-1 rounded hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1"
                    aria-label="Copy transaction ID"
                  >
                    {copiedTxId ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border",
                    getTypeColor(transaction.type)
                  )}
                >
                  {getTypeIcon(transaction.type)}
                  {transaction.type}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border",
                    getStatusColor(transaction.status)
                  )}
                >
                  {getStatusIcon(transaction.status)}
                  {transaction.status}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                <p className="text-sm">
                  {transaction.date}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className={cn(
                  "text-2xl font-bold",
                  transaction.type === "Deposit" ? "text-green-600" : "text-foreground"
                )}
                >
                  <span className="mr-1">
                    {transaction.type === "Deposit" ? "+" : transaction.type === "Withdraw" ? "-" : ""}
                  </span>
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </p>
                {transaction.type === "Convert" && transaction.toAmount != null && transaction.toCurrency && (
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">You received</p>
                    <p className="text-lg font-semibold">
                      {transaction.toAmount.toLocaleString()} {transaction.toCurrency}
                    </p>
                  </div>
                )}
              </div>

              {transaction.type === "Convert" && transaction.exchangeRate != null && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Exchange Rate</p>
                  <p className="text-sm">
                    1 {transaction.toCurrency} = {transaction.exchangeRate.toLocaleString()} {transaction.currency}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm break-all">
                  {getWalletAddress()}
                </p>
                <button
                  onClick={() => handleCopy(getWalletAddress(), 'address')}
                  className="p-1 rounded hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1"
                  aria-label="Copy wallet address"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {transaction.fee != null && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Fee</p>
                <p className="text-sm">
                  {transaction.fee.toLocaleString()} {transaction.currency}
                </p>
              </div>
            )}

            {transaction.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.description}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
