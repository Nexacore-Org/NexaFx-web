import api from "@/services/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useProfileSettings() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/profile");
      return data;
    },
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.put("/profile", payload);
      return data;
    },
  });
}

// TODO: Add notification + security hooks when API endpoints are ready
