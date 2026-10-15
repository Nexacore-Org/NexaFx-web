export interface Currency {
  code: string
  name: string
  symbol: string
  decimals: number
  type: 'fiat' | 'crypto'
  icon: string
}

export const currencies: Record<string, Currency> = {
  ngn: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimals: 2,
    type: 'fiat',
    icon: '/currencies/ngn.svg',
  },
  usd: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    type: 'fiat',
    icon: '/currencies/usd.svg',
  },
  eur: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimals: 2,
    type: 'fiat',
    icon: '/currencies/eur.svg',
  },
  gbp: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimals: 2,
    type: 'fiat',
    icon: '/currencies/gbp.svg',
  },
  xlm: {
    code: 'XLM',
    name: 'Stellar',
    symbol: 'XLM',
    decimals: 7,
    type: 'crypto',
    icon: '/currencies/xlm.svg',
  },
  usdc: {
    code: 'USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    type: 'crypto',
    icon: '/currencies/usdc.svg',
  },
  btc: {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    decimals: 8,
    type: 'crypto',
    icon: '/currencies/btc.svg',
  },
  eth: {
    code: 'ETH',
    name: 'Ethereum',
    symbol: 'Ξ',
    decimals: 18,
    type: 'crypto',
    icon: '/currencies/eth.svg',
  },
}

export function getCurrency(code: string): Currency | undefined {
  return currencies[code.toLowerCase()]
}

export function formatCode(code: string): string {
  const currency = getCurrency(code)
  return currency ? currency.symbol : code
}