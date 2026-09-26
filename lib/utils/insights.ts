import type { Transaction } from '../api/transactions'

export interface SpendingInsights {
  totalConvertedThisMonth: number
  totalWithdrawnThisMonth: number
  totalDepositedThisMonth: number
  mostUsedPair: string
  biggestTransaction: Transaction | null
  averageTransactionAmount: number
  monthlyTrend: MonthlyTotal[]
  mostActiveDay: string
}

export interface MonthlyTotal {
  month: string
  converted: number
  withdrawn: number
  deposited: number
}

function getMonthLabel(date: Date): string {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

function isCurrentMonth(date: Date): boolean {
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export function calculateInsights(transactions: Transaction[]): SpendingInsights {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const thisMonthTxs = transactions.filter(t => isCurrentMonth(new Date(t.date)))
  const totalConvertedThisMonth = thisMonthTxs
    .filter(t => t.type === 'Convert')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawnThisMonth = thisMonthTxs
    .filter(t => t.type === 'Withdraw')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalDepositedThisMonth = thisMonthTxs
    .filter(t => t.type === 'Deposit')
    .reduce((sum, t) => sum + t.amount, 0)

  const convertPairs = transactions
    .filter(t => t.type === 'Convert' && t.toCurrency)
  const pairCounts: Record<string, number> = {}
  convertPairs.forEach(t => {
    const pair = `${t.currency} → ${t.toCurrency}`
    pairCounts[pair] = (pairCounts[pair] || 0) + 1
  })
  const mostUsedPair = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

  const biggestTransaction = transactions.length > 0
    ? transactions.reduce((max, t) => t.amount > max.amount ? t : max, transactions[0])
    : null

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const averageTransactionAmount = transactions.length > 0 ? totalAmount / transactions.length : 0

  const monthBuckets: Record<string, MonthlyTotal> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = getMonthLabel(d)
    monthBuckets[label] = { month: label, converted: 0, withdrawn: 0, deposited: 0 }
  }

  transactions.forEach(t => {
    const date = new Date(t.date)
    if (date >= sixMonthsAgo) {
      const label = getMonthLabel(date)
      if (monthBuckets[label]) {
        if (t.type === 'Convert') monthBuckets[label].converted += t.amount
        else if (t.type === 'Withdraw') monthBuckets[label].withdrawn += t.amount
        else if (t.type === 'Deposit') monthBuckets[label].deposited += t.amount
      }
    }
  })

  const monthlyTrend = Object.values(monthBuckets).sort((a, b) => {
    const aDate = new Date(a.month)
    const bDate = new Date(b.month)
    return aDate.getTime() - bDate.getTime()
  })

  const dayCounts: Record<string, number> = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0,
  }
  transactions.forEach(t => {
    const day = new Date(t.date).toLocaleString('en-US', { weekday: 'long' })
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })
  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

  return {
    totalConvertedThisMonth,
    totalWithdrawnThisMonth,
    totalDepositedThisMonth,
    mostUsedPair,
    biggestTransaction,
    averageTransactionAmount,
    monthlyTrend,
    mostActiveDay,
  }
}
