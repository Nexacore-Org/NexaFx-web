import { Transaction } from "../api/transactions";

export function exportTransactionsToCSV(transactions: Transaction[], filename?: string) {
  // Define CSV headers
  const headers = ['Date', 'Type', 'Currency', 'Amount', 'Status', 'Reference', 'Description'];
  
  // Convert transactions to CSV rows
  const csvRows = transactions.map(transaction => {
    const date = new Date(transaction.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return [
      date,
      transaction.type,
      transaction.currency,
      transaction.amount.toString(),
      transaction.status,
      transaction.reference,
      transaction.description || ''
    ].map(field => `"${field.replace(/"/g, '""')}"`); // Escape quotes and wrap in quotes
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.map(header => `"${header}"`).join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');
  
  // Generate filename if not provided
  const defaultFilename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  const finalFilename = filename || defaultFilename;
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function generateCSVFilename(dateFrom?: string, dateTo?: string): string {
  const today = new Date().toISOString().split('T')[0];
  
  if (dateFrom && dateTo) {
    return `transactions-${dateFrom}-to-${dateTo}.csv`;
  } else if (dateFrom) {
    return `transactions-from-${dateFrom}.csv`;
  } else if (dateTo) {
    return `transactions-to-${dateTo}.csv`;
  } else {
    return `transactions-${today}.csv`;
  }
}