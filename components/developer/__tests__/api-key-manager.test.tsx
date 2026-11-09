import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ApiKeyManager from "@/components/developer/api-key-manager";
import type { ApiKey, CreatedApiKey } from "@/lib/api/api-keys";

const mockListApiKeys = vi.fn();
const mockCreateApiKey = vi.fn();
const mockRevokeApiKey = vi.fn();

vi.mock("@/lib/api/api-keys", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/api-keys")>(
      "@/lib/api/api-keys",
    );
  return {
    ...actual,
    listApiKeys: () => mockListApiKeys(),
    createApiKey: (input: unknown) => mockCreateApiKey(input),
    revokeApiKey: (id: string) => mockRevokeApiKey(id),
  };
});

const sampleKeys: ApiKey[] = [
  {
    id: "key-1",
    name: "Production Gateway",
    prefix: "nxf_live_prod1",
    createdAt: "2026-11-01T10:00:00Z",
    lastUsedAt: "2026-11-05T12:00:00Z",
    scopes: ["payments:read", "transfers:write"],
  },
  {
    id: "key-2",
    name: "Staging Bot",
    prefix: "nxf_test_stg2",
    createdAt: "2026-11-02T10:00:00Z",
    lastUsedAt: null,
    scopes: ["read_only"],
  },
];

function renderWithClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <ApiKeyManager />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockListApiKeys.mockReset();
  mockCreateApiKey.mockReset();
  mockRevokeApiKey.mockReset();
});

afterEach(cleanup);

describe("ApiKeyManager", () => {
  it("loads existing keys on mount using useQuery and displays metadata, lastUsedAt, and scopes", async () => {
    mockListApiKeys.mockResolvedValue(sampleKeys);
    renderWithClient();

    expect(screen.getByText("Loading API keys…")).toBeInTheDocument();

    expect(await screen.findByText("Production Gateway")).toBeInTheDocument();
    expect(screen.getByText("nxf_live_prod1…")).toBeInTheDocument();
    expect(screen.getByText(/Last used/)).toBeInTheDocument();
    expect(screen.getByText("payments:read")).toBeInTheDocument();
    expect(screen.getByText("transfers:write")).toBeInTheDocument();

    expect(screen.getByText("Staging Bot")).toBeInTheDocument();
    expect(screen.getByText("nxf_test_stg2…")).toBeInTheDocument();
    expect(screen.getByText("Never used")).toBeInTheDocument();
    expect(screen.getByText("read_only")).toBeInTheDocument();
    expect(mockListApiKeys).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when no keys exist", async () => {
    mockListApiKeys.mockResolvedValue([]);
    renderWithClient();

    expect(await screen.findByText("No API keys yet.")).toBeInTheDocument();
  });

  it("shows load error alert when list query fails", async () => {
    mockListApiKeys.mockRejectedValue(new Error("Network connection lost"));
    renderWithClient();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Network connection lost");
  });

  it("creates a key, displays the secret ONCE in the reveal dialog, and ensures secret never appears in list state", async () => {
    mockListApiKeys.mockResolvedValue([]);
    const createdKey: CreatedApiKey = {
      id: "key-secret-123",
      name: "Secret Automation Agent",
      prefix: "nxf_live_sec88",
      createdAt: "2026-11-09T18:00:00Z",
      lastUsedAt: null,
      scopes: ["webhooks:all"],
      secret: "nxf_live_EXCLUSIVE_ONE_TIME_SECRET_TOKEN_DO_NOT_LEAK",
    };
    mockCreateApiKey.mockResolvedValue(createdKey);

    renderWithClient();
    await screen.findByText("No API keys yet.");

    // Open create dialog
    fireEvent.click(screen.getByRole("button", { name: "Create key" }));
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "Secret Automation Agent" } });

    // Submit creation
    const submitBtn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(submitBtn);

    // Reveal dialog should appear with the one-time secret
    expect(
      await screen.findByText("nxf_live_EXCLUSIVE_ONE_TIME_SECRET_TOKEN_DO_NOT_LEAK"),
    ).toBeInTheDocument();
    expect(screen.getByText("Copy your API key")).toBeInTheDocument();

    // Verify key metadata appears in the underlying list
    expect(screen.getByText("Secret Automation Agent")).toBeInTheDocument();
    expect(screen.getByText("nxf_live_sec88…")).toBeInTheDocument();

    // Close the reveal dialog
    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);

    // After closing reveal, secret must NOT be in the DOM
    await waitFor(() => {
      expect(
        screen.queryByText("nxf_live_EXCLUSIVE_ONE_TIME_SECRET_TOKEN_DO_NOT_LEAK"),
      ).not.toBeInTheDocument();
    });

    // The key metadata persists in the list with prefix and Never used
    expect(screen.getByText("Secret Automation Agent")).toBeInTheDocument();
    expect(screen.getByText("nxf_live_sec88…")).toBeInTheDocument();
    expect(screen.getByText("Never used")).toBeInTheDocument();
  });

  it("handles revoke flow with busy state and removes the key on success", async () => {
    mockListApiKeys.mockResolvedValue(sampleKeys);
    let resolveRevoke: () => void = () => {};
    mockRevokeApiKey.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRevoke = resolve;
      }),
    );

    renderWithClient();
    await screen.findByText("Production Gateway");

    // Click revoke on first key
    const revokeButtons = screen.getAllByRole("button", { name: "Revoke" });
    fireEvent.click(revokeButtons[0]);

    // Confirmation dialog is shown
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Revoke this key?")).toBeInTheDocument();

    // Confirm revoke inside dialog
    const confirmButton = within(dialog).getByRole("button", { name: "Revoke" });
    fireEvent.click(confirmButton);

    // Shows busy state
    expect(within(dialog).getByRole("button", { name: "Revoking…" })).toBeDisabled();

    // Resolve mutation
    resolveRevoke();

    // Dialog closes and key is removed from list
    await waitFor(() => {
      expect(screen.queryByText("Production Gateway")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Staging Bot")).toBeInTheDocument();
  });

  it("displays inline error in revoke confirmation dialog when revoke fails", async () => {
    mockListApiKeys.mockResolvedValue(sampleKeys);
    mockRevokeApiKey.mockRejectedValue(new Error("Unauthorized revoke request"));

    renderWithClient();
    await screen.findByText("Production Gateway");

    // Click revoke on first key
    const revokeButtons = screen.getAllByRole("button", { name: "Revoke" });
    fireEvent.click(revokeButtons[0]);

    // Confirm revoke inside dialog
    const dialog = screen.getByRole("dialog");
    const confirmButton = within(dialog).getByRole("button", { name: "Revoke" });
    fireEvent.click(confirmButton);

    // Error is rendered in alert within dialog
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent("Unauthorized revoke request");

    // Key still in the list (present both in list and open dialog)
    expect(screen.getAllByText("Production Gateway")).toHaveLength(2);
  });
});
