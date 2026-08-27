/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { AdminTransaction } from "@/lib/api/admin";

const escapeCsvField = (field: unknown) => {
  if (field === null || field === undefined) return '""'
  const stringField = String(field)
  if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`
  }
  return stringField
}

const downloadCsv = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportTransactionsToCsv = (transactions: AdminTransaction[]): void => {
  if (!transactions.length) return;
  const headers = ['ID', 'Type', 'Status', 'Amount', 'Currency', 'Username', 'Date', 'TxId']
  const rows = transactions.map(t => [
    escapeCsvField(t.id),
    escapeCsvField(t.type),
    escapeCsvField(t.status),
    escapeCsvField(t.amount),
    escapeCsvField(t.currency),
    escapeCsvField(t.username),
    escapeCsvField(t.date),
    escapeCsvField(t.txId),
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadCsv(csvContent, `nexafx-admin-transactions-${new Date().toISOString().split('T')[0]}.csv`)
}

export const exportTransactionsCsv = (transactions: any[], filename: string): void => {
  if (!transactions.length) return
  const headers = ['ID', 'Type', 'Status', 'Amount', 'Currency', 'To Amount', 'To Currency', 'Date']
  const rows = transactions.map(t => [
    escapeCsvField(t.id),
    escapeCsvField(t.type),
    escapeCsvField(t.status),
    escapeCsvField(t.amount),
    escapeCsvField(t.currency),
    escapeCsvField(t.toAmount ?? ''),
    escapeCsvField(t.toCurrency ?? ''),
    escapeCsvField(t.date ? new Date(t.date).toLocaleDateString() : ''),
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadCsv(csvContent, filename)
}

export const exportUserGrowthCsv = (data: any, filename: string): void => {
  const headers = ['Date', 'New Users', 'Total Users']
  const rows = (data?.growth ?? []).map((g: any) => [
    escapeCsvField(g.date),
    escapeCsvField(g.newUsers ?? 0),
    escapeCsvField(g.totalUsers ?? 0),
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadCsv(csvContent, filename)
}

export const exportRevenueCsv = (data: any, filename: string): void => {
  const headers = ['Period', 'Revenue', 'Expenses', 'Profit']
  const rows = (data?.revenue ?? []).map((r: any) => [
    escapeCsvField(r.period),
    escapeCsvField(r.revenue ?? 0),
    escapeCsvField(r.expenses ?? 0),
    escapeCsvField(r.profit ?? 0),
  ])
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadCsv(csvContent, filename)
}

export const exportTransactionsPdf = (transactions: any[], dateRange: { from: string; to: string }): void => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('NexaFx Transaction Report', 14, 22)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
  doc.text(`Period: ${dateRange.from} - ${dateRange.to}`, 14, 36)

  const totalVolume = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
  doc.setFontSize(12)
  doc.text(`Total transactions: ${transactions.length}`, 14, 48)
  doc.text(`Total volume: ${totalVolume.toLocaleString()}`, 14, 54)

  const tableColumns = ['ID', 'Type', 'Status', 'Amount', 'Currency', 'Date']
  const tableRows = transactions.map(t => [t.id, t.type, t.status, t.amount, t.currency, t.date])
  ;(doc as any).autoTable({
    startY: 62,
    head: [tableColumns],
    body: tableRows,
  })

  doc.save(`nexafx-transactions-${dateRange.from}-${dateRange.to}.pdf`)
}

export const exportRevenuePdf = (data: any, dateRange: { from: string; to: string }): void => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('NexaFx Revenue Summary', 14, 22)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
  doc.text(`Period: ${dateRange.from} - ${dateRange.to}`, 14, 36)

  const totalRevenue = (data?.revenue ?? []).reduce((sum: number, r: any) => sum + (r.revenue || 0), 0)
  doc.setFontSize(12)
  doc.text(`Total revenue: ${totalRevenue.toLocaleString()}`, 14, 48)

  const tableColumns = ['Period', 'Revenue', 'Expenses', 'Profit']
  const tableRows = (data?.revenue ?? []).map((r: any) => [
    r.period,
    r.revenue?.toLocaleString() ?? '0',
    r.expenses?.toLocaleString() ?? '0',
    r.profit?.toLocaleString() ?? '0',
  ])
  ;(doc as any).autoTable({
    startY: 56,
    head: [tableColumns],
    body: tableRows,
  })

  doc.save(`nexafx-revenue-${dateRange.from}-${dateRange.to}.pdf`)
}
