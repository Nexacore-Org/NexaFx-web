"use client";

import { Transaction } from "@/lib/api/transactions";

interface TransactionReceiptProps {
  transaction: Transaction;
}

export function buildReceiptText(tx: Transaction): string {
  const separator = "──────────────────────────";
  const lines: string[] = [
    "NexaFx Transaction Receipt",
    separator,
    `Transaction ID: ${tx.reference || tx.id}`,
    `Date: ${tx.date}`,
    `Type: ${tx.type === "Convert" ? "Currency Conversion" : tx.type}`,
    `Status: ${tx.status === "Success" ? "✓ Successful" : tx.status}`,
    "",
  ];

  if (tx.type === "Convert" && tx.toCurrency) {
    lines.push(`You sent:     ${tx.amount.toLocaleString()} ${tx.currency}`);
    if (tx.toAmount != null) {
      lines.push(
        `You received: ${tx.toAmount.toLocaleString()} ${tx.toCurrency}`
      );
    }
    if (tx.exchangeRate != null) {
      lines.push(
        `Exchange rate: 1 ${tx.toCurrency} = ${tx.exchangeRate.toLocaleString()} ${tx.currency}`
      );
    }
  } else {
    lines.push(`Amount: ${tx.amountString}`);
  }

  if (tx.fee != null) {
    lines.push(`Fee: ${tx.fee.toLocaleString()} ${tx.currency}`);
  }

  if (tx.walletAddress) {
    lines.push("");
    lines.push(`From wallet: ${tx.walletAddress}`);
  }

  lines.push(separator);
  lines.push("NexaFx — nexafx.io");

  return lines.join("\n");
}

export function TransactionReceipt({ transaction }: TransactionReceiptProps) {
  const tx = transaction;
  const separator = "──────────────────────────";

  return (
    <div
      id="print-receipt"
      style={{ display: "none" }}
      className="print:block font-mono text-sm p-8"
    >
      <p className="font-bold text-lg mb-1">NexaFx Transaction Receipt</p>
      <p>{separator}</p>
      <p>Transaction ID: {tx.reference || tx.id}</p>
      <p>Date: {tx.date}</p>
      <p>
        Type:{" "}
        {tx.type === "Convert" ? "Currency Conversion" : tx.type}
      </p>
      <p>
        Status:{" "}
        {tx.status === "Success" ? "✓ Successful" : tx.status}
      </p>
      <br />
      {tx.type === "Convert" && tx.toCurrency ? (
        <>
          <p>You sent:&nbsp;&nbsp;&nbsp;&nbsp; {tx.amount.toLocaleString()} {tx.currency}</p>
          {tx.toAmount != null && (
            <p>
              You received: {tx.toAmount.toLocaleString()} {tx.toCurrency}
            </p>
          )}
          {tx.exchangeRate != null && (
            <p>
              Exchange rate: 1 {tx.toCurrency} ={" "}
              {tx.exchangeRate.toLocaleString()} {tx.currency}
            </p>
          )}
        </>
      ) : (
        <p>Amount: {tx.amountString}</p>
      )}
      {tx.fee != null && (
        <p>
          Fee: {tx.fee.toLocaleString()} {tx.currency}
        </p>
      )}
      {tx.walletAddress && (
        <>
          <br />
          <p>From wallet: {tx.walletAddress}</p>
        </>
      )}
      <p>{separator}</p>
      <p>NexaFx — nexafx.io</p>
    </div>
  );
}
