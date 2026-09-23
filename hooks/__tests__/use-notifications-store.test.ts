import { act } from "react";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { Notification } from "@/types/notification";

const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: "notif-1",
  title: "Test Notification",
  message: "Test message",
  isRead: false,
  type: "INFO",
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("useNotificationsStore unreadCount recomputation", () => {
  beforeEach(() => {
    act(() => {
      useNotificationsStore.getState().setNotifications([]);
    });
  });

  it("setNotifications correctly recomputes unreadCount from mixed read/unread list", () => {
    const notifications = [
      createMockNotification({ id: "1", isRead: false }),
      createMockNotification({ id: "2", isRead: true }),
      createMockNotification({ id: "3", isRead: false }),
      createMockNotification({ id: "4", isRead: true }),
      createMockNotification({ id: "5", isRead: false }),
    ];

    act(() => {
      useNotificationsStore.getState().setNotifications(notifications);
    });

    const state = useNotificationsStore.getState();
    expect(state.notifications).toEqual(notifications);
    expect(state.unreadCount).toBe(3);
  });

  it("setNotifications sets unreadCount to 0 when all notifications are read", () => {
    const notifications = [
      createMockNotification({ id: "1", isRead: true }),
      createMockNotification({ id: "2", isRead: true }),
    ];

    act(() => {
      useNotificationsStore.getState().setNotifications(notifications);
    });

    expect(useNotificationsStore.getState().unreadCount).toBe(0);
  });

  it("setNotifications sets unreadCount to total when all notifications are unread", () => {
    const notifications = [
      createMockNotification({ id: "1", isRead: false }),
      createMockNotification({ id: "2", isRead: false }),
      createMockNotification({ id: "3", isRead: false }),
    ];

    act(() => {
      useNotificationsStore.getState().setNotifications(notifications);
    });

    expect(useNotificationsStore.getState().unreadCount).toBe(3);
  });

  it("addNotification correctly increments unreadCount when added notification is unread", () => {
    act(() => {
      useNotificationsStore.getState().setNotifications([
        createMockNotification({ id: "1", isRead: true }),
        createMockNotification({ id: "2", isRead: false }),
      ]);
    });

    expect(useNotificationsStore.getState().unreadCount).toBe(1);

    const newUnreadNotification = createMockNotification({
      id: "3",
      isRead: false,
    });

    act(() => {
      useNotificationsStore.getState().addNotification(newUnreadNotification);
    });

    expect(useNotificationsStore.getState().unreadCount).toBe(2);
    expect(useNotificationsStore.getState().notifications).toHaveLength(3);
  });

  it("addNotification does not increment unreadCount when added notification is read", () => {
    act(() => {
      useNotificationsStore.getState().setNotifications([
        createMockNotification({ id: "1", isRead: false }),
      ]);
    });

    expect(useNotificationsStore.getState().unreadCount).toBe(1);

    const newReadNotification = createMockNotification({
      id: "2",
      isRead: true,
    });

    act(() => {
      useNotificationsStore.getState().addNotification(newReadNotification);
    });

    expect(useNotificationsStore.getState().unreadCount).toBe(1);
    expect(useNotificationsStore.getState().notifications).toHaveLength(2);
  });

  it("addNotification adds notification to the beginning of the list", () => {
    act(() => {
      useNotificationsStore.getState().setNotifications([
        createMockNotification({ id: "1", isRead: false }),
      ]);
    });

    const newNotification = createMockNotification({ id: "2", isRead: false });

    act(() => {
      useNotificationsStore.getState().addNotification(newNotification);
    });

    const notifications = useNotificationsStore.getState().notifications;
    expect(notifications[0].id).toBe("2");
    expect(notifications[1].id).toBe("1");
  });
});