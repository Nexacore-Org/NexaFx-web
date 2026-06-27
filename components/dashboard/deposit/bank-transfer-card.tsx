"use client";

import { useState } from "react";
import { Copy, Check, Building2, Hash, User, Clock, DollarSign } from "lucide-react";

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

const BANK_DETAILS = {
  bankName: "GTBank Plc",
  accountName: "NexaFX Global Services Ltd",
  accountNumber: "0123456789",
  referenceId: "NEX-REF-2024-001",
  sortCode: "032",
  minAmount: 1000,
  maxAmount: 10000000,
  currency: "NGN",
  expectedArrival: "1-2 business hours",
};

const DEPOSIT_STEPS = [
  "Log in to your mobile banking app or internet banking platform.",
  "Add NexaFX Global Services Ltd as a new beneficiary using the account details above.",
  "Transfer the desired amount using your unique Reference/Mandate ID as the narration.",
  "After the transfer, return to your NexaFX dashboard. Your wallet will be credited automatically within 1-2 business hours.",
  "If the deposit does not reflect after 2 hours, contact our support team with your transaction reference.",
];

export function BankTransferCard() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => handleCopy(value, field)}
      className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
      aria-label={copiedField === field ? "Copied" : `Copy ${field}`}
    >
      {copiedField === field ? <CheckIcon /> : <CopyIcon />}
    </button>
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-full bg-zinc-100 p-2.5 dark:bg-zinc-800">
          <Building2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Bank Transfer
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Deposit NGN directly from your bank account
          </p>
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-3 mb-6">
        {/* Account Number */}
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                Virtual Account Number
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-wider">
                {BANK_DETAILS.accountNumber}
              </p>
            </div>
            <CopyButton value={BANK_DETAILS.accountNumber} field="accountNumber" />
          </div>
        </div>

        {/* Bank Name */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Bank</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {BANK_DETAILS.bankName}
              </p>
            </div>
          </div>
        </div>

        {/* Account Name */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Account Name</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {BANK_DETAILS.accountName}
              </p>
            </div>
          </div>
          <CopyButton value={BANK_DETAILS.accountName} field="accountName" />
        </div>

        {/* Reference/Mandate ID */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <Hash className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Reference / Mandate ID</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                {BANK_DETAILS.referenceId}
              </p>
            </div>
          </div>
          <CopyButton value={BANK_DETAILS.referenceId} field="referenceId" />
        </div>
      </div>

      {/* Amount Range & Expected Time */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Min Amount</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                ₦{BANK_DETAILS.minAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Max Amount</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                ₦{BANK_DETAILS.maxAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Expected Arrival Time</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {BANK_DETAILS.expectedArrival}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Instructions */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 mb-3 dark:text-zinc-100">
          Deposit Instructions
        </h4>
        <ol className="space-y-3">
          {DEPOSIT_STEPS.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-zinc-900">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
