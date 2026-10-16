import { apiRequest } from '@/lib/api-client'

export interface WalletBalance {
  currency: string
  balance: string
}

export interface WalletsData {
  balances: WalletBalance[]
  depositAddress: string | null
}

function normalizeBalances(payload: unknown): WalletBalance[] {
  const candidates =
    Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && 'balances' in payload
        ? (payload as { balances?: unknown }).balances
        : payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data?: unknown }).data
          : []

  if (!Array.isArray(candidates)) return []

  return candidates
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const record = entry as Record<string, unknown>
      const currency = record.currency ?? record.code
      const balance = record.balance ?? record.amount ?? '0'
      if (typeof currency !== 'string') return null
      return {
        currency: currency.toUpperCase(),
        balance: String(balance),
      }
    })
    .filter((entry): entry is WalletBalance => entry !== null)
}

function extractAddress(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  const address = record.depositAddress ?? record.walletAddress ?? record.address
  return typeof address === 'string' && address.length > 0 ? address : null
}

export async function getWallets(): Promise<WalletsData> {
  const payload = await apiRequest<unknown>('/wallets')
  return {
    balances: normalizeBalances(payload),
    depositAddress: extractAddress(payload),
  }
}
