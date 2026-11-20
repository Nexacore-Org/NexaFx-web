"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types/user";

export interface UpdateProfileInput {
  firstName: string | null;
  lastName: string | null;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput): Promise<User> => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      const data = (await response.json()) as { user: User };
      return data.user;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(queryKeys.profile, updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}
