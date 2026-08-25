import { create } from "zustand";
import { Notification } from "@/types/notification";
import * as api from "@/lib/api/notifications";

const UNDO_DELAY = 5000;

interface PendingDelete {
  notification: Notification;
  timer: ReturnType<typeof setTimeout>;
}

interface PendingClearAll {
  notifications: Notification[];
  timer: ReturnType<typeof setTimeout>;
}

interface NotificationsStore {
  notifications: Notification[];
  isOpen: boolean;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pendingDeletes: Map<string, PendingDelete>;
  pendingClearAll: PendingClearAll | null;

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
  undoDelete: (id: string) => void;
  clearAllNotifications: () => void;
  undoClearAll: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  isOpen: false,
  unreadCount: 0,
  isLoading: false,
  error: null,
  pendingDeletes: new Map(),
  pendingClearAll: null,

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
    const prevNotifications = useNotificationsStore.getState().notifications;
    const prevUnreadCount = useNotificationsStore.getState().unreadCount;
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
    api.markAsRead(id).catch(() => {
        set({ notifications: prevNotifications, unreadCount: prevUnreadCount });
    });
  },

  markAllAsRead: () => {
    const prevNotifications = useNotificationsStore.getState().notifications;
    const prevUnreadCount = useNotificationsStore.getState().unreadCount;
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    api.markAllAsRead().catch(() => {
        set({ notifications: prevNotifications, unreadCount: prevUnreadCount });
    });
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),

  removeNotification: (id) => {
    const state = get();
    if (state.pendingDeletes.has(id)) return;

    const notification = state.notifications.find((n) => n.id === id);
    if (!notification) return;

    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
      unreadCount: s.unreadCount - (!notification.isRead ? 1 : 0),
    }));

    const timer = setTimeout(() => {
      const current = get();
      if (current.pendingDeletes.has(id)) {
        api.deleteNotification(id).catch(() => {});
        set((s) => {
          const next = new Map(s.pendingDeletes);
          next.delete(id);
          return { pendingDeletes: next };
        });
      }
    }, UNDO_DELAY);

    set((s) => {
      const next = new Map(s.pendingDeletes);
      const existing = next.get(id);
      if (existing) clearTimeout(existing.timer);
      next.set(id, { notification, timer });
      return { pendingDeletes: next };
    });
  },

  undoDelete: (id) => {
    const state = get();
    const pending = state.pendingDeletes.get(id);
    if (!pending) return;

    clearTimeout(pending.timer);

    set((s) => {
      const next = new Map(s.pendingDeletes);
      next.delete(id);
      return {
        pendingDeletes: next,
        notifications: [pending.notification, ...s.notifications],
        unreadCount: s.unreadCount + (!pending.notification.isRead ? 1 : 0),
      };
    });
  },

  clearAllNotifications: () => {
    const state = get();
    if (state.notifications.length === 0) return;

    const notificationsCopy = [...state.notifications];

    const timer = setTimeout(() => {
      const current = get();
      if (current.pendingClearAll) {
        current.pendingClearAll.notifications.forEach((n) => {
          api.deleteNotification(n.id).catch(() => {});
        });
        set({ pendingClearAll: null });
      }
    }, UNDO_DELAY);

    set({
      notifications: [],
      unreadCount: 0,
      pendingClearAll: { notifications: notificationsCopy, timer },
    });
  },

  undoClearAll: () => {
    const state = get();
    if (!state.pendingClearAll) return;

    clearTimeout(state.pendingClearAll.timer);

    const restored = state.pendingClearAll.notifications;
    set({
      notifications: restored,
      unreadCount: restored.filter((n) => !n.isRead).length,
      pendingClearAll: null,
    });
  },
}));
