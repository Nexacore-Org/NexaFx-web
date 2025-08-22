import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "./config";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  priority: NotificationPriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
  channel: NotificationChannel;
  expirationDate?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationCategory {
  INFO = "INFO",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH_NOTIFICATION = "PUSH_NOTIFICATION",
  BOTH = "both",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum NotificationType {
  SYSTEM = "SYSTEM",
  PROJECT = "PROJECT",
  TRANSACTION = "TRANSACTION",
  MESSAGING = "MESSAGING",
  CONTRIBUTION = "CONTRIBUTION",
  INVITATION = "INVITATION",
  SWAP_COMPLETED = "swap_completed",
  WALLET_UPDATED = "wallet_updated",
  TRANSACTION_FAILED = "transaction_failed",
  DEPOSIT_CONFIRMED = "deposit_confirmed",
  WITHDRAWAL_PROCESSED = "withdrawal_processed",
  DEPOSIT_PENDING = "deposit_pending",
}

const getNotifications = async (userId: string): Promise<Notification[]> => {
  const response = await axiosClient.get(
    API_ENDPOINTS.NOTIFICATIONS.GET(userId)
  );
  return response.data;
};

const markAsRead = async (notifId: string): Promise<{ message: string }> => {
  const response = await axiosClient.patch(
    API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notifId)
  );
  return response.data;
};

const markAllAsRead = async (userId: string): Promise<{ message: string }> => {
  const response = await axiosClient.patch(
    API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ(userId)
  );
  return response.data;
};

export const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
