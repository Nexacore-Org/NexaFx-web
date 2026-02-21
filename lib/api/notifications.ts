import { Notification } from "@/types/notification";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getNotifications(
  page = 1,
  limit = 20
): Promise<Notification[]> {
  const res = await fetch(
    `${API_BASE}/notifications?page=${page}&limit=${limit}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch notifications");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data ?? data.notifications ?? []);
}

export async function markAsRead(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
}

export async function markAllAsRead(): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/batch/mark-all-read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all notifications as read");
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete notification");
}

export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch unread count");
  const data = await res.json();
  return data.count ?? data.unreadCount ?? 0;
}
