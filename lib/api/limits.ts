import { apiClient } from '../api-client'

export interface TransactionLimits {
  currency: string
  minDeposit: number
  maxDeposit: number
  minWithdrawal: number
  maxWithdrawal: number
  dailyLimit: number
  monthlyLimit: number
}

export const getLimits = (currency: string): Promise<TransactionLimits> =>
  apiClient(`/limits?currency=${currency}`, { useProxy: false })
