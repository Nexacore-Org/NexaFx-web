"use client";

import { useState } from "react";
import { X, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "recipient" | "amount" | "review" | "result";

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendMoneyModal({ isOpen, onClose }: SendMoneyModalProps) {
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState("");
  const [recipientType, setRecipientType] = useState<"address" | "username">("address");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BTC");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const reset = () => {
    setStep("recipient");
    setRecipient("");
    setRecipientType("address");
    setAmount("");
    setCurrency("BTC");
    setError(null);
    setIsSubmitting(false);
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateRecipient = (): boolean => {
    if (!recipient.trim()) {
      setError("Recipient is required");
      return false;
    }
    if (recipientType === "address" && recipient.trim().length < 10) {
      setError("Please enter a valid wallet address");
      return false;
    }
    if (recipientType === "username" && !recipient.includes("@") && recipient.trim().length < 3) {
      setError("Please enter a valid email or username");
      return false;
    }
    setError(null);
    return true;
  };

  const validateAmount = (): boolean => {
    if (!amount.trim()) {
      setError("Amount is required");
      return false;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === "recipient" && validateRecipient()) {
      setStep("amount");
    } else if (step === "amount" && validateAmount()) {
      setStep("review");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // TODO: Wire to actual send-money API endpoint
      // await apiClient('/transactions/send', {
      //   method: 'POST',
      //   body: JSON.stringify({ recipient, amount: parseFloat(amount), currency }),
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResult({ success: true, message: "Transfer initiated successfully!" });
      setStep("result");
    } catch {
      setResult({ success: false, message: "Transfer failed. Please try again." });
      setStep("result");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={handleClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Send Money</h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4">
            {step === "recipient" && (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecipientType("address")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                      recipientType === "address"
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground border border-border",
                    )}
                  >
                    Wallet Address
                  </button>
                  <button
                    onClick={() => setRecipientType("username")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                      recipientType === "username"
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground border border-border",
                    )}
                  >
                    Email / Username
                  </button>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {recipientType === "address" ? "Wallet Address" : "Email or Username"}
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={
                      recipientType === "address"
                        ? "0x..."
                        : "user@example.com"
                    }
                    className="w-full mt-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            {step === "amount" && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Amount
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                      if (error) setError(null);
                    }}
                    placeholder="0.00"
                    className="w-full mt-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </>
            )}

            {step === "review" && (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="font-medium text-foreground truncate ml-4">
                      {recipient}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium text-foreground">
                      {amount} {currency}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === "result" && result && (
              <div className="text-center py-4 space-y-3">
                {result.success ? (
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                )}
                <p className={cn(
                  "text-sm font-medium",
                  result.success ? "text-green-600" : "text-red-600",
                )}>
                  {result.message}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-1.5 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-border flex gap-3">
            {step === "result" ? (
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            ) : step === "review" ? (
              <>
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Confirm <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
