import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/api/notifications", () => ({
  getNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}));

import * as api from "@/lib/api/notifications";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
};

const mockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: "1",
  title: "Test Notification",
  message: "Test message",
  isRead: false,
  createdAt: new Date().toISOString(),
  type: "info",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  useNotificationsStore.setState({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    isLoading: false,
    error: null,
    pendingDeletes: new Map(),
    pendingClearAll: null,
  });
});

describe("useNotificationsStore", () => {
  describe("markAsRead", () => {
    it("optimistically updates state immediately", () => {
      const notification = mockNotification({ id: "1", isRead: false });
      vi.mocked(api.markAsRead).mockImplementation(
        () => new Promise(() => {})
      );

      useNotificationsStore.setState({
        notifications: [notification],
        unreadCount: 1,
      });

      useNotificationsStore.getState().markAsRead("1");

      const state = useNotificationsStore.getState();
      expect(state.notifications[0].isRead).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it("rolls back on API failure", async () => {
      const notification = mockNotification({ id: "1", isRead: false });
      vi.mocked(api.markAsRead).mockRejectedValue(new Error("Network error"));

      useNotificationsStore.setState({
        notifications: [notification],
        unreadCount: 1,
      });

      useNotificationsStore.getState().markAsRead("1");

      await new Promise((resolve) => setTimeout(resolve, 10));

      const state = useNotificationsStore.getState();
      expect(state.notifications[0].isRead).toBe(false);
      expect(state.unreadCount).toBe(1);
    });
  });

  describe("markAllAsRead", () => {
    it("optimistically marks all as read", () => {
      const notifications = [
        mockNotification({ id: "1", isRead: false }),
        mockNotification({ id: "2", isRead: false }),
        mockNotification({ id: "3", isRead: true }),
      ];
      vi.mocked(api.markAllAsRead).mockImplementation(
        () => new Promise(() => {})
      );

      useNotificationsStore.setState({
        notifications,
        unreadCount: 2,
      });

      useNotificationsStore.getState().markAllAsRead();

      const state = useNotificationsStore.getState();
      expect(state.notifications.every((n) => n.isRead)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it("rolls back on API failure", async () => {
      const notifications = [
        mockNotification({ id: "1", isRead: false }),
        mockNotification({ id: "2", isRead: true }),
      ];
      vi.mocked(api.markAllAsRead).mockRejectedValue(new Error("Network error"));

      useNotificationsStore.setState({
        notifications,
        unreadCount: 1,
      });

      useNotificationsStore.getState().markAllAsRead();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const state = useNotificationsStore.getState();
      expect(state.notifications[0].isRead).toBe(false);
      expect(state.notifications[1].isRead).toBe(true);
      expect(state.unreadCount).toBe(1);
    });
  });

  describe("setNotifications", () => {
    it("sets notifications and computes unread count", () => {
      const notifications = [
        mockNotification({ id: "1", isRead: false }),
        mockNotification({ id: "2", isRead: true }),
        mockNotification({ id: "3", isRead: false }),
      ];

      useNotificationsStore.getState().setNotifications(notifications);

      const state = useNotificationsStore.getState();
      expect(state.notifications).toHaveLength(3);
      expect(state.unreadCount).toBe(2);
    });
  });
});
