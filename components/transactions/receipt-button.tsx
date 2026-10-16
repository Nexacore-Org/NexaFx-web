"use client";

import { useState } from "react";
import { buildReceiptData } from "@/lib/receipt";
import { notify } from "@/lib/notify";
import type { Transaction } from "@/lib/api/transactions";

// ---------------------------------------------------------------------------
// PDF rendering (loaded lazily to avoid bloating the initial bundle)
// ---------------------------------------------------------------------------

async function generatePdf(tx: Transaction, userName: string): Promise<void> {
  // Dynamic import — jsPDF is NOT included in the initial page bundle.
  // Only pulled in when the user clicks "Download receipt".
  const { jsPDF } = await import("jspdf");

  const data = buildReceiptData(tx, userName);

  const doc = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const line = (extra = 0) => {
    y += extra;
  };

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74); // emerald-600
  doc.text(data.appName, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.text("Transaction Receipt", margin, y);
  y += 6;

  // Horizontal rule
  doc.setDrawColor(228, 228, 231); // zinc-200
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ── Body helper ─────────────────────────────────────────────────────────
  function row(label: string, value: string) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(113, 113, 122);
    doc.text(label, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(24, 24, 27); // zinc-900

    // Wrap long values
    const lines = doc.splitTextToSize(value, contentWidth - 40);
    doc.text(lines, pageWidth - margin, y, { align: "right" });
    y += Math.max(lines.length * 5, 6);
    line(1);
  }

  row("Reference", data.referenceId);
  row("Date & Time", data.dateTime);
  row("Type", data.type);
  row("Amount", data.sourceAmount);
  if (data.destinationAmount) row("Received", data.destinationAmount);
  if (data.rate) row("Rate", data.rate);
  if (data.fee) row("Fee", data.fee);
  row("Status", data.status);
  if (data.destination) row("Destination", data.destination);
  if (data.hash)
    row("Stellar Hash", `${data.hash.slice(0, 12)}…${data.hash.slice(-12)}`);

  y += 4;
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── Footer ───────────────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(161, 161, 170); // zinc-400
  doc.text(`Issued to: ${data.userName}`, margin, y);
  y += 5;
  doc.text("NexaFx — keep this receipt for your records.", margin, y);

  doc.save(data.filename);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ReceiptButtonProps {
  transaction: Transaction;
  userName?: string;
}

/**
 * Download-receipt button.
 *
 * - Only enabled for `completed` transactions; all other statuses show a
 *   tooltip explaining why the button is disabled.
 * - The jsPDF library is dynamically imported on first click, keeping it
 *   out of the initial page bundle.
 */
export function ReceiptButton({
  transaction,
  userName = "NexaFx User",
}: ReceiptButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const isCompleted = transaction.status === "completed";

  const handleDownload = async () => {
    if (!isCompleted || downloading) return;
    setDownloading(true);
    try {
      await generatePdf(transaction, userName);
      notify.success("Receipt downloaded successfully.");
    } catch (err) {
      notify.error(
        `Could not generate receipt: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <span
      title={
        !isCompleted
          ? `Receipts are only available for completed transactions. This transaction is ${transaction.status}.`
          : undefined
      }
    >
      <button
        type="button"
        onClick={handleDownload}
        disabled={!isCompleted || downloading}
        aria-label={
          downloading
            ? "Generating PDF receipt…"
            : isCompleted
              ? "Download PDF receipt"
              : `Receipt unavailable — transaction is ${transaction.status}`
        }
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        {downloading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17h6M9 13h6M9 9h3"
              />
            </svg>
            Download Receipt
          </>
        )}
      </button>
    </span>
  );
}
