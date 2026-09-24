import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PushNotificationsPage from "./page";

vi.mock("@/lib/api/admin", () => ({
  getAdminPushNotifications: vi.fn(),
  createAdminPushNotification: vi.fn(),
}));

import { getAdminPushNotifications, createAdminPushNotification } from "@/lib/api/admin";

const mockNotifications = [
  {
    id: "n1",
    title: "System Update",
    message: "Scheduled maintenance tonight",
    status: "Active",
    createdAt: "2025-06-01",
  },
  {
    id: "n2",
    title: "New Feature",
    message: "Check out the new convert tool",
    status: "Active",
    createdAt: "2025-06-02",
  },
];

describe("PushNotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list from API", async () => {
    vi.mocked(getAdminPushNotifications).mockResolvedValue(mockNotifications);

    render(<PushNotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("System Update")).toBeInTheDocument();
    });
    expect(screen.getByText("New Feature")).toBeInTheDocument();
  });

  it("create form submits to API", async () => {
    vi.mocked(getAdminPushNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(createAdminPushNotification).mockResolvedValue({
      id: "n3",
      title: "Test Push",
      message: "Test message",
      status: "Active",
      createdAt: "2025-06-03",
    });

    render(<PushNotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("System Update")).toBeInTheDocument();
    });

    const createButtons = screen.getAllByText(/create/i);
    await userEvent.click(createButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("PUSH NOTIFICATION LISTING")).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    vi.mocked(getAdminPushNotifications).mockReturnValue(new Promise(() => {}));

    const { container } = render(<PushNotificationsPage />);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
