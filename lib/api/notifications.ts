import { Notification } from "@/types/notification";
import { apiClient } from "../api-client";

interface NotificationsResponse {
  data?: Notification[];
  notifications?: Notification[];
}

interface UnreadCountResponse {
  count?: number;
  unreadCount?: number;
}

interface NotificationsResponse {
  data?: Notification[];
  notifications?: Notification[];
}

interface UnreadCountResponse {
  count?: number;
  unreadCount?: number;
}

export async function getNotifications(
  page = 1,
  limit = 20
): Promise<Notification[]> {
    const data = await apiClient<NotificationsResponse | Notification[]>("/notifications", {
    params: { page: String(page), limit: String(limit) },
    useProxy: false,
  });
  return (Array.isArray(data) ? data : (data.data ?? data.notifications ?? [])) as Notification[];
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
    const data = await apiClient<UnreadCountResponse>("/notifications/unread-count", {
    useProxy: false,
  });
  return (data as UnreadCountResponse).count ?? (data as UnreadCountResponse).unreadCount ?? 0;
}
