/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import {
  exportTransactionsCsv,
  exportTransactionsPdf,
  exportRevenueCsv,
  exportRevenuePdf,
  exportUserGrowthCsv,
} from '@/lib/utils/export'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: new Date().toISOString().split('T')[0] })
  const [transactions] = useState<any[]>([])
  const [revenueData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Export transaction, growth, and revenue reports</p>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Transaction Report */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Transaction Report</h3>
                <p className="text-xs text-gray-500">{transactions.length} transactions</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => exportTransactionsPdf(transactions, dateRange)}
                disabled={transactions.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export PDF
              </button>
              <button
                onClick={() => exportTransactionsCsv(transactions, `nexafx-transactions-${dateRange.from}-${dateRange.to}.csv`)}
                disabled={transactions.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            {transactions.length > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                Total volume: {transactions.reduce((s: number, t: any) => s + (t.amount || 0), 0).toLocaleString()}
              </div>
            )}
          </div>

          {/* Revenue Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Revenue Summary</h3>
                <p className="text-xs text-gray-500">{(revenueData?.revenue ?? []).length} entries</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => exportRevenuePdf(revenueData || { revenue: [] }, dateRange)}
                disabled={!(revenueData?.revenue?.length)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export PDF
              </button>
              <button
                onClick={() => exportRevenueCsv(revenueData || { revenue: [] }, `nexafx-revenue-${dateRange.from}-${dateRange.to}.csv`)}
                disabled={!(revenueData?.revenue?.length)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* User Growth Report */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Growth</h3>
                <p className="text-xs text-gray-500">Monthly new user data</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
              >
                <Download size={16} />
                Export PDF
              </button>
              <button
                onClick={() => exportUserGrowthCsv({ growth: [] }, `nexafx-user-growth-${dateRange.from}-${dateRange.to}.csv`)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
