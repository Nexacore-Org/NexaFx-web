export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  decimals: number
  type: 'fiat' | 'crypto'
}

const currencyRegistry: Record<string, CurrencyInfo> = {
  usd: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, type: 'fiat' },
  eur: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, type: 'fiat' },
  ngn: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2, type: 'fiat' },
  xlm: { code: 'XLM', name: 'Stellar', symbol: 'XLM', decimals: 7, type: 'crypto' },
  usdc: { code: 'USDC', name: 'USD Coin', symbol: 'USDC', decimals: 6, type: 'crypto' },
  btc: { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8, type: 'crypto' },
  eth: { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimals: 18, type: 'crypto' },
}

export function getCurrency(code: string): CurrencyInfo | undefined {
  return currencyRegistry[code.toLowerCase()]
}

export function formatMoney(
  amount: number | string,
  currencyCode: string,
  options: { compact?: boolean } = {}
): string {
  const numericAmount = typeof amount === 'string' ? parseAmount(amount) : amount
  if (isNaN(numericAmount)) return '0.00'

  const currency = getCurrency(currencyCode) || { decimals: 2, symbol: '' }
  const decimals = currency.decimals

  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  const formatted = formatter.format(numericAmount)
  const sign = numericAmount < 0 ? '-' : ''

  if (options.compact) {
    return `${sign}${formatted / Math.pow(10, decimals)}k`
  }

  return `${sign}${formatted}`
}

export function parseAmount(input: string): number {
  if (!input) return 0
  const cleaned = input.replace(/[^\d.,-]/g, '')
  const parts = cleaned.split('.')
  const integerPart = parts[0].replace(/,/g, '')
  const decimalPart = parts[1] ? parts[1].padEnd(2, '0') : '00'
  return parseFloat(`${integerPart}.${decimalPart}`)
}

export function compareAmounts(a: number | string, b: number | string): number {
  const aNum = typeof a === 'string' ? parseAmount(a) : a
  const bNum = typeof b === 'string' ? parseAmount(b) : b
  if (aNum < bNum) return -1
  if (aNum > bNum) return 1
  return 0
}