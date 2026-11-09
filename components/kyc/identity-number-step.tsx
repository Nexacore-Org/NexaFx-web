"use client";

import { useState } from "react";
import Link from "next/link";
import {
  submitBvn,
  submitNin,
  IdentityVerificationError,
  offersDocumentFallback,
} from "@/lib/api/kyc";

export type IdentityNumberKind = "bvn" | "nin";

export interface IdentityNumberStepProps {
  kind: IdentityNumberKind;
  onSuccess: () => void;
  onFallbackToDocuments?: () => void;
  submitFn?: (value: string) => Promise<unknown>;
}

interface StepConfig {
  label: string;
  subtext: string;
  placeholder: string;
  helpText: string;
  fallbackError: string;
  buttonLabel: string;
  buttonLoadingLabel: string;
  defaultSubmit: (val: string) => Promise<unknown>;
}

const STEP_CONFIG: Record<IdentityNumberKind, StepConfig> = {
  bvn: {
    label: "Bank Verification Number (BVN)",
    subtext:
      "Enter your 11-digit BVN for instant verification. Dial *565*0# on your registered phone to check.",
    placeholder: "12345678901",
    helpText:
      "In compliance with Central Bank regulations and financial security standards, we verify your identity against verified records. Your BVN does not grant access to your bank accounts. Read our ",
    fallbackError:
      "We could not verify your BVN at this time. Please try again.",
    buttonLabel: "Verify BVN",
    buttonLoadingLabel: "Verifying BVN...",
    defaultSubmit: submitBvn,
  },
  nin: {
    label: "National Identification Number (NIN)",
    subtext:
      "Enter your 11-digit National Identity Number. Dial *346# on your registered phone to check.",
    placeholder: "12345678901",
    helpText:
      "NIN verification verifies your identity with the National Identity Management Commission (NIMC) to unlock higher account tiers and secure transactions. Read our ",
    fallbackError:
      "We could not verify your NIN at this time. Please try again.",
    buttonLabel: "Verify NIN",
    buttonLoadingLabel: "Verifying NIN...",
    defaultSubmit: submitNin,
  },
};

export function IdentityNumberStep({
  kind,
  onSuccess,
  onFallbackToDocuments,
  submitFn,
}: IdentityNumberStepProps) {
  const [value, setValue] = useState("");
  const [isMasked, setIsMasked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDocumentFallback, setShowDocumentFallback] = useState(false);

  const config = STEP_CONFIG[kind];
  const cleanDigits = value.replace(/\D/g, "");
  const isValidLength = cleanDigits.length === 11;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 11);
    setValue(digitsOnly);
    setError(null);
    setShowDocumentFallback(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidLength || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setShowDocumentFallback(false);

    try {
      const executeSubmit = submitFn ?? config.defaultSubmit;
      await executeSubmit(cleanDigits);
      // Clear sensitive identity number from state immediately upon completion
      setValue("");
      onSuccess();
    } catch (err) {
      if (err instanceof IdentityVerificationError) {
        setError(err.message);
        if (offersDocumentFallback(err)) {
          setShowDocumentFallback(true);
        }
      } else {
        setError(config.fallbackError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaskedDisplay = () => {
    if (!value) return "";
    if (value.length <= 4) return value;
    return "•".repeat(value.length - 4) + value.slice(-4);
  };

  const inputId = `${kind}-input`;
  const helpId = `${kind}-help`;
  const errorId = `${kind}-error`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {config.label}
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {config.subtext}
        </p>

        <div className="relative mt-2">
          <input
            id={inputId}
            type={isMasked ? "password" : "text"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={11}
            value={value}
            onChange={handleInputChange}
            disabled={isSubmitting}
            placeholder={config.placeholder}
            autoComplete="off"
            className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 font-mono text-sm tracking-wider text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-hidden disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
            required
            aria-describedby={`${helpId} ${errorId}`}
          />

          {value.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              aria-pressed={isMasked}
              aria-label={isMasked ? "Show" : "Mask"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {isMasked ? "Show" : "Mask"}
            </button>
          )}
        </div>

        {value.length > 0 && !isMasked && value.length === 11 && (
          <p className="mt-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            Preview: {getMaskedDisplay()}
          </p>
        )}
      </div>

      <div
        id={helpId}
        className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400"
      >
        <p className="font-medium text-zinc-700 dark:text-zinc-300">
          Why do we need this?
        </p>
        <p className="mt-1">
          {config.helpText}
          <Link
            href="/privacy"
            target="_blank"
            className="font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {error && (
        <div
          id={errorId}
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          <p>{error}</p>
          {showDocumentFallback && onFallbackToDocuments && (
            <button
              type="button"
              onClick={onFallbackToDocuments}
              className="mt-2 text-xs font-medium text-red-900 underline hover:text-red-800 dark:text-red-200"
            >
              Verify with documents (ID & selfie) instead →
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValidLength || isSubmitting}
        className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? config.buttonLoadingLabel : config.buttonLabel}
      </button>
    </form>
  );
}
