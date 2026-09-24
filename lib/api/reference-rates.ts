let cachedRates: Record<string, number> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000

export const getReferenceRate = async (from: string, to: string): Promise<number> => {
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedRates[to] || 0
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await response.json()
    if (data.rates) {
      cachedRates = data.rates
      cacheTimestamp = Date.now()
      return data.rates[to] || 0
    }
  } catch {
    if (cachedRates) return cachedRates[to] || 0
  }
  return 0
}
