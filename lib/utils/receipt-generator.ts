import { Transaction } from "@/lib/api/transactions";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Success":
      return "#16a34a";
    case "Pending":
      return "#ca8a04";
    case "Failed":
      return "#dc2626";
    default:
      return "#6b7280";
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "Deposit":
      return "Deposit";
    case "Withdraw":
      return "Withdrawal";
    case "Convert":
      return "Currency Conversion";
    default:
      return type;
  }
}

export function generateReceiptHTML(tx: Transaction): string {
  const statusColor = getStatusColor(tx.status);
  const typeLabel = getTypeLabel(tx.type);
  const generatedAt = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let extraRows = "";
  if (tx.toCurrency) {
    extraRows += `
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">To Currency</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${escapeHtml(tx.toCurrency)}</td>
      </tr>`;
  }
  if (tx.toAmount != null) {
    extraRows += `
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Amount Received</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${tx.toAmount.toLocaleString()} ${escapeHtml(tx.toCurrency ?? "")}</td>
      </tr>`;
  }
  if (tx.exchangeRate != null) {
    extraRows += `
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Exchange Rate</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${String(tx.exchangeRate)}</td>
      </tr>`;
  }
  if (tx.fee != null) {
    extraRows += `
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Fee</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${tx.fee.toLocaleString()} ${escapeHtml(tx.currency)}</td>
      </tr>`;
  }
  if (tx.description) {
    extraRows += `
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Description</td>
        <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${escapeHtml(tx.description)}</td>
      </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transaction Receipt - ${escapeHtml(tx.reference)}</title>
  <style>
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#F0BB16 0%,#F39A00 100%);padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:#000;font-size:20px;font-weight:700;">NexaFx</h1>
      <p style="margin:4px 0 0;color:#000;opacity:0.7;font-size:12px;">Transaction Receipt</p>
    </div>

    <div style="padding:32px;">
      <!-- Amount -->
      <div style="text-align:center;padding:20px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;color:#6b7280;font-size:13px;">${escapeHtml(typeLabel)}</p>
        <h2 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#111827;">${escapeHtml(tx.amountString)}</h2>
      </div>

      <!-- Details -->
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Date & Time</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${escapeHtml(tx.date)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Status</td>
          <td style="padding:8px 0;text-align:right;">
            <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;color:#fff;background:${statusColor};">
              ${escapeHtml(tx.status)}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Currency</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${escapeHtml(tx.currency)}</td>
        </tr>
        ${extraRows}
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">Reference ID</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;font-family:monospace;font-size:12px;">${escapeHtml(tx.reference)}</td>
        </tr>
      </table>

      <!-- Footer -->
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:11px;">Generated on ${escapeHtml(generatedAt)}</p>
        <p style="margin:4px 0 0;color:#9ca3af;font-size:11px;">This receipt was generated client-side from your transaction data.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadReceipt(tx: Transaction): void {
  const html = generateReceiptHTML(tx);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
