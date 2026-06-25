import { Transaction } from "@/lib/api/admin";

export const exportTransactionsToCsv = (transactions: Transaction[]): void => {
  if (!transactions.length) return;

  // Headers: ID, Type, Status, Amount, Currency, To Amount, To Currency, Date
  const headers = ["ID", "Type", "Status", "Amount", "Currency", "To Amount", "To Currency", "Date"];

  const escapeCsvField = (field: unknown) => {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const rows = transactions.map(tx => [
    escapeCsvField(tx.id),
    escapeCsvField(tx.type),
    escapeCsvField(tx.status),
    escapeCsvField(tx.amount),
    escapeCsvField(tx.currency),
    escapeCsvField(tx.toAmount ?? ""),
    escapeCsvField(tx.toCurrency ?? ""),
    escapeCsvField(new Date(tx.date).toLocaleDateString())
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
  link.href = url;
  link.setAttribute("download", `nexafx-transactions-${today}.csv`);
  
  // Required for Firefox
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};
