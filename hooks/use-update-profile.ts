'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile, type ProfileUpdate } from '@/lib/api/profile'
import { queryKeys } from '@/lib/query-keys'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProfileUpdate) => updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}
