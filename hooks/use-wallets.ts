'use client'

import { useQuery } from '@tanstack/react-query'
import { getWallets } from '@/lib/api/wallets'
import { queryKeys } from '@/lib/query-keys'

export function useWallets() {
  return useQuery({
    queryKey: queryKeys.wallets,
    queryFn: getWallets,
    staleTime: 30_000,
  })
}
