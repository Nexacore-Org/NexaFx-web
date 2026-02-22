import { create } from "zustand";
import { Notification } from "@/types/notification";
import * as api from "@/lib/api/notifications";

interface NotificationsStore {
  notifications: Notification[];
  isOpen: boolean;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Panel actions
  open: () => void;
  close: () => void;
  toggle: () => void;

  // Notification actions
  setNotifications: (notifications: Notification[]) => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  isOpen: false,
  unreadCount: 0,
  isLoading: false,
  error: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await api.getNotifications();
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load notifications",
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await api.getUnreadCount();
      set({ unreadCount: count });
    } catch {
    }
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
    api.markAsRead(id).catch(() => {});
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    api.markAllAsRead().catch(() => {});
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadCount:
          state.unreadCount - (notification && !notification.isRead ? 1 : 0),
      };
    });
    api.deleteNotification(id).catch(() => {});
  },
}));
