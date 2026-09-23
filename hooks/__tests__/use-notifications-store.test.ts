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

const mockNotification = (
  overrides: Partial<Notification> = {},
): Notification => ({
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
      vi.mocked(api.markAsRead).mockImplementation(() => new Promise(() => {}));

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
        () => new Promise(() => {}),
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
      vi.mocked(api.markAllAsRead).mockRejectedValue(
        new Error("Network error"),
      );

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

  describe("concurrent optimistic actions", () => {
    it("a failed markAsRead rollback does not clobber a different notification's still-valid markAsRead", async () => {
      const notifications = [
        mockNotification({ id: "1", isRead: false }),
        mockNotification({ id: "2", isRead: false }),
      ];

      useNotificationsStore.setState({ notifications, unreadCount: 2 });

      // "1" will fail and should roll back; "2" fires right after and
      // succeeds. If rollback used a snapshot captured before "2" ran,
      // it would incorrectly revert "2" as well.
      vi.mocked(api.markAsRead).mockImplementation((id: string) =>
        id === "1"
          ? Promise.reject(new Error("Network error"))
          : Promise.resolve(),
      );

      useNotificationsStore.getState().markAsRead("1");
      useNotificationsStore.getState().markAsRead("2");

      await new Promise((resolve) => setTimeout(resolve, 10));

      const state = useNotificationsStore.getState();
      const n1 = state.notifications.find((n) => n.id === "1");
      const n2 = state.notifications.find((n) => n.id === "2");

      expect(n1?.isRead).toBe(false); // rolled back
      expect(n2?.isRead).toBe(true); // untouched by "1"'s rollback
      expect(state.unreadCount).toBe(1);
    });

    it("a failed markAllAsRead rollback does not clobber a notification removed in the meantime", async () => {
      const notifications = [
        mockNotification({ id: "1", isRead: false }),
        mockNotification({ id: "2", isRead: false }),
      ];

      useNotificationsStore.setState({
        notifications,
        unreadCount: 2,
        pendingDeletes: new Map(),
      });

      vi.mocked(api.markAllAsRead).mockRejectedValue(
        new Error("Network error"),
      );
      vi.mocked(api.deleteNotification).mockImplementation(
        () => new Promise(() => {}),
      );

      useNotificationsStore.getState().markAllAsRead();
      // "2" gets removed (optimistically) before the markAllAsRead
      // rollback runs.
      useNotificationsStore.getState().removeNotification("2");

      await new Promise((resolve) => setTimeout(resolve, 10));

      const state = useNotificationsStore.getState();
      expect(state.notifications.map((n) => n.id)).toEqual(["1"]);
      expect(state.notifications[0].isRead).toBe(false); // rolled back
      expect(state.unreadCount).toBe(1);
    });

    it("removeNotification restores the notification if the deferred delete API call fails", async () => {
      vi.useFakeTimers();
      const notification = mockNotification({ id: "1", isRead: false });

      useNotificationsStore.setState({
        notifications: [notification],
        unreadCount: 1,
        pendingDeletes: new Map(),
      });

      vi.mocked(api.deleteNotification).mockRejectedValue(
        new Error("Network error"),
      );

      useNotificationsStore.getState().removeNotification("1");
      expect(useNotificationsStore.getState().notifications).toHaveLength(0);

      await vi.advanceTimersByTimeAsync(5000);

      const state = useNotificationsStore.getState();
      expect(state.notifications.map((n) => n.id)).toEqual(["1"]);
      expect(state.unreadCount).toBe(1);
      expect(state.pendingDeletes.has("1")).toBe(false);

      vi.useRealTimers();
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
