import { notificationService } from "@/services/api/notificationService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications(userId),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationService.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
