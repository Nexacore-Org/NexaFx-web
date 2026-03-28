import { Notification } from "@/types/notification";
import { apiClient } from "../api-client";

export async function getNotifications(
  page = 1,
  limit = 20
): Promise<Notification[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiClient<any>("/notifications", {
    params: { page: String(page), limit: String(limit) },
    useProxy: false,
  });
  return Array.isArray(data) ? data : (data.data ?? data.notifications ?? []);
}

export async function markAsRead(id: string): Promise<void> {
  return apiClient(`/notifications/${id}/read`, {
    method: "PATCH",
    useProxy: false,
  });
}

export async function markAllAsRead(): Promise<void> {
  return apiClient("/notifications/batch/mark-all-read", {
    method: "PATCH",
    useProxy: false,
  });
}

export async function deleteNotification(id: string): Promise<void> {
  return apiClient(`/notifications/${id}`, {
    method: "DELETE",
    useProxy: false,
  });
}

export async function getUnreadCount(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await apiClient<any>("/notifications/unread-count", {
    useProxy: false,
  });
  return data.count ?? data.unreadCount ?? 0;
}
