export interface PortfolioAllocation {
  currency: string
  amount: number
  ngnEquivalent: number
  percentage: number
}

export const calculatePortfolioAllocation = (
  balances: { currency: string; balance: number }[],
  rates: Record<string, number>
): PortfolioAllocation[] => {
  const totalNgn = balances.reduce((sum, b) => {
    const rate = rates[b.currency] || (b.currency === 'NGN' ? 1 : 0)
    return sum + b.balance * rate
  }, 0)

  if (totalNgn === 0) {
    return balances.map(b => ({
      currency: b.currency,
      amount: b.balance,
      ngnEquivalent: 0,
      percentage: 0,
    }))
  }

  return balances.map(b => {
    const rate = rates[b.currency] || (b.currency === 'NGN' ? 1 : 0)
    const ngnEq = b.balance * rate
    return {
      currency: b.currency,
      amount: b.balance,
      ngnEquivalent: ngnEq,
      percentage: (ngnEq / totalNgn) * 100,
    }
  }).filter(a => a.amount > 0)
}
