"use client";

import { useState, useEffect } from "react";
import { Mail, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getTransactions, type Transaction } from "@/lib/api/transactions";
import { resendConfirmationEmail, requestStatement } from "@/lib/api/transactions";

export function EmailPreferences() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementFormat, setStatementFormat] = useState<"pdf" | "csv">("pdf");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statementPreview, setStatementPreview] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const result = await getTransactions({ limit: 10 });
      setTransactions(result.data);
    } catch {
      setErrorMessage("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(transactionId: string) {
    setResendingId(transactionId);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const result = await resendConfirmationEmail(transactionId);
      if (result.success) {
        setSuccessMessage("Confirmation email resent successfully");
      } else {
        setErrorMessage(result.message || "Failed to resend confirmation");
      }
    } catch {
      setErrorMessage("Failed to resend confirmation email");
    } finally {
      setResendingId(null);
    }
  }

  async function handleRequestStatement() {
    setStatementLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setStatementPreview(null);
    try {
      const result = await requestStatement({ format: statementFormat });
      if (result.success) {
        setSuccessMessage("Weekly statement requested successfully");
        if (result.previewUrl) {
          setStatementPreview(result.previewUrl);
        }
      } else {
        setErrorMessage(result.message || "Failed to request statement");
      }
    } catch {
      setErrorMessage("Failed to request statement");
    } finally {
      setStatementLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Email & Statements</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your email preferences and request account statements
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Recent Transactions</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No transactions found</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {tx.type}
                    </span>
                    <span className="text-xs text-gray-400">{tx.date}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {tx.amountString}
                  </p>
                </div>
                <button
                  onClick={() => handleResend(tx.id)}
                  disabled={resendingId === tx.id}
                  className="ml-4 inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {resendingId === tx.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  Resend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Statement */}
      <div className="space-y-4 rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700">Weekly Statement</h3>
        <p className="text-xs text-gray-500">
          Request a statement of your recent transactions to be sent to your email
        </p>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Format:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setStatementFormat("pdf")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statementFormat === "pdf"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setStatementFormat("csv")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statementFormat === "csv"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              CSV
            </button>
          </div>
        </div>

        <button
          onClick={handleRequestStatement}
          disabled={statementLoading}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {statementLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Request Weekly Statement
        </button>

        {statementPreview && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-700 mb-1">Statement Preview</p>
            <p className="text-xs text-gray-500 break-all">{statementPreview}</p>
          </div>
        )}
      </div>
    </div>
  );
}
