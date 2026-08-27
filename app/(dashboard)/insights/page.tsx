"use client"

import { useState, useEffect } from "react"
import { getTransactions } from "@/lib/api/transactions"
import { calculateInsights, type SpendingInsights } from "@/lib/utils/insights"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, ArrowUpDown, ArrowDownToLine, ArrowUpFromLine, Calendar, Loader2 } from "lucide-react"

export default function InsightsPage() {
  const [insights, setInsights] = useState<SpendingInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const result = await getTransactions({ limit: 1000 })
        const computed = calculateInsights(result.data)
        setInsights(computed)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load insights")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<TrendingUp className="h-12 w-12" />}
        title="Unable to load insights"
        description={error}
      />
    )
  }

  if (!insights || (insights.totalConvertedThisMonth === 0 && insights.totalWithdrawnThisMonth === 0 && insights.totalDepositedThisMonth === 0 && !insights.biggestTransaction)) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Spending Insights</h1>
        <EmptyState
          icon={<TrendingUp className="h-12 w-12" />}
          title="No insights yet"
          description="Make your first transaction to see your spending patterns."
        />
      </div>
    )
  }

  const statCards = [
    { label: "Converted This Month", value: insights.totalConvertedThisMonth, icon: ArrowUpDown, color: "text-blue-600" },
    { label: "Deposited This Month", value: insights.totalDepositedThisMonth, icon: ArrowDownToLine, color: "text-green-600" },
    { label: "Withdrawn This Month", value: insights.totalWithdrawnThisMonth, icon: ArrowUpFromLine, color: "text-red-600" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Spending Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.mostUsedPair && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <ArrowUpDown className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Top Currency Pair</p>
                  <p className="text-lg font-semibold">You convert {insights.mostUsedPair} most often</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {insights.biggestTransaction && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Biggest Transaction</p>
                  <p className="text-lg font-semibold">
                    {insights.biggestTransaction.amount.toLocaleString()} {insights.biggestTransaction.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">{insights.biggestTransaction.type} — {insights.biggestTransaction.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Average Transaction</p>
            <p className="text-lg font-semibold">{insights.averageTransactionAmount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Most Active Day</p>
                <p className="text-lg font-semibold">{insights.mostActiveDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Monthly Trend (6 Months)</h2>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="converted" fill="#3b82f6" name="Converted" />
                <Bar dataKey="deposited" fill="#22c55e" name="Deposited" />
                <Bar dataKey="withdrawn" fill="#ef4444" name="Withdrawn" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
