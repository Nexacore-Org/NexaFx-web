'use client';

import React, { useState, useRef } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Transaction, raiseDispute } from '@/lib/api/transactions';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { cn } from '@/lib/utils';

interface DisputeFormModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DISPUTE_REASONS = [
  "Transaction amount is incorrect",
  "Transaction did not arrive",
  "I did not authorise this transaction",
  "Duplicate transaction",
  "Other"
];

export function DisputeFormModal({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}: DisputeFormModalProps) {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, onClose, modalRef);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason) {
      setError('Please select a reason for your dispute.');
      return;
    }

    if (description.length < 30) {
      setError('Description must be at least 30 characters.');
      return;
    }

    if (description.length > 1000) {
      setError('Description cannot exceed 1000 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedDescription = `Reason: ${reason}\n\n${description}`;
      await raiseDispute(transaction.id, combinedDescription);
      setIsSuccess(true);
      // Let the success message show for a moment, or rely on the user to close/call onSuccess
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit dispute. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-card text-card-foreground rounded-xl p-6 shadow-2xl border border-border/50 w-full max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Raise a Dispute</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              aria-label="Close dispute modal"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-2" />
              <h3 className="text-xl font-semibold">Dispute Submitted</h3>
              <p className="text-muted-foreground">
                Your dispute has been submitted. Our team will review it within 2–3 business days.
              </p>
              <button
                onClick={onSuccess}
                className="mt-6 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Summary (Read-only) */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h3 className="text-sm font-semibold mb-2">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Transaction ID</p>
                    <p className="font-mono break-all">{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Type</p>
                    <p>{transaction.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Amount</p>
                    <p className="font-semibold">{transaction.amountString}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Date</p>
                    <p>{transaction.date}</p>
                  </div>
                </div>
              </div>

              {/* Dispute Reason */}
              <div className="space-y-2">
                <label htmlFor="reason" className="block text-sm font-medium">
                  Reason for dispute
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Select a reason...</option>
                  {DISPUTE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Additional Details
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide more details about this transaction..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                  minLength={30}
                  maxLength={1000}
                  required
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minimum 30 characters</span>
                  <span className={cn(description.length > 1000 ? "text-red-500" : "")}>
                    {description.length}/1000
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-500/10 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-input bg-background hover:bg-muted text-foreground font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Dispute"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
