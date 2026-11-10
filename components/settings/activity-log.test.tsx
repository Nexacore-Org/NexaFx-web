import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import messagesEn from "../../messages/en.json";
import messagesFr from "../../messages/fr.json";
import ActivityLog from "./activity-log";
import { fetchActivity, type ActivityPage } from "../../lib/api/activity";

vi.mock("../../lib/api/activity", async () => {
  const actual = await vi.importActual("../../lib/api/activity");
  return {
    ...actual,
    fetchActivity: vi.fn(),
  };
});

const mockActivityPage: ActivityPage = {
  events: [
    {
      id: "evt-1",
      type: "login",
      occurredAt: "2026-11-10T10:00:00Z",
      description: null,
      device: "MacBook Pro",
      ipAddress: "192.168.1.1",
      redacted: false,
    },
    {
      id: "evt-2",
      type: "login_failed",
      occurredAt: "2026-11-10T09:30:00Z",
      description: null,
      device: null,
      ipAddress: "10.0.0.1",
      redacted: false,
    },
    {
      id: "evt-3",
      type: "password_changed",
      occurredAt: "2026-11-09T15:00:00Z",
      description: null,
      device: "iPhone",
      ipAddress: "10.0.0.2",
      redacted: true,
    },
  ],
  cursor: null,
};

function renderActivityLog(
  queryClient?: QueryClient,
  locale = "en",
  messages: typeof messagesEn = messagesEn,
) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  return {
    ...render(
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Africa/Lagos"
      >
        <QueryClientProvider client={client}>
          <ActivityLog />
        </QueryClientProvider>
      </NextIntlClientProvider>,
    ),
    queryClient: client,
  };
}

describe("ActivityLog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders loading skeleton initially", () => {
    vi.mocked(fetchActivity).mockReturnValue(new Promise(() => {}));
    renderActivityLog();
    expect(
      screen.getByLabelText("Loading account activity"),
    ).toBeInTheDocument();
  });

  it("renders error alert with retry button on failure", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchActivity).mockRejectedValueOnce(
      new Error("Failed to fetch"),
    );

    renderActivityLog();

    await waitFor(() => {
      expect(
        screen.getByText("We could not load your account activity."),
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: "Retry" });
    expect(retryBtn).toBeInTheDocument();

    vi.mocked(fetchActivity).mockResolvedValueOnce(mockActivityPage);
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("Signed in")).toBeInTheDocument();
    });
  });

  it("formats day headings and times with active locale in English", async () => {
    vi.mocked(fetchActivity).mockResolvedValueOnce(mockActivityPage);

    renderActivityLog(undefined, "en", messagesEn);

    await waitFor(() => {
      expect(screen.getByText("Signed in")).toBeInTheDocument();
    });

    // English date headings
    expect(
      screen.getByRole("heading", { name: /Tuesday, November 10, 2026/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Monday, November 9, 2026/i }),
    ).toBeInTheDocument();

    // Notable badge and redacted notice
    expect(screen.getByText("Unusual activity")).toBeInTheDocument();
    expect(
      screen.getByText("Device and network details are hidden for this event."),
    ).toBeInTheDocument();
  });

  it("switches date headings and copy when active locale is French", async () => {
    vi.mocked(fetchActivity).mockResolvedValueOnce(mockActivityPage);

    renderActivityLog(undefined, "fr", messagesFr);

    await waitFor(() => {
      expect(screen.getByText("Signed in")).toBeInTheDocument();
    });

    // French date headings
    expect(
      screen.getByRole("heading", { name: /mardi 10 novembre 2026/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /lundi 9 novembre 2026/i }),
    ).toBeInTheDocument();

    // Localized French notices
    expect(screen.getByText("Activité inhabituelle")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Les détails de l'appareil et du réseau sont masqués pour cet événement.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Tous les événements")).toBeInTheDocument();
  });
});
