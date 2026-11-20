import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ fetchProfile: vi.fn(), updateProfile: vi.fn() }));
vi.mock("../../../../lib/api/user", () => api);
import SettingsProfilePage from "./page";

describe("SettingsProfilePage", () => {
  it("keeps edits through a refetch and saves them", async () => {
    api.fetchProfile.mockResolvedValue({ firstName: "Ada", lastName: "Obi", phone: "0800", email: "a@b.c" });
    api.updateProfile.mockImplementation(async (v) => ({ ...v, email: "a@b.c" }));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><SettingsProfilePage /></QueryClientProvider>);

    const first = await screen.findByLabelText("First name");
    fireEvent.change(first, { target: { value: "Adaeze" } });
    await act(() => client.refetchQueries({ queryKey: ["profile"] }));
    expect((screen.getByLabelText("First name") as HTMLInputElement).value).toBe("Adaeze");
    expect((screen.getByLabelText("Phone") as HTMLInputElement).value).toBe("0800");

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(api.updateProfile.mock.calls[0][0]).toEqual({ firstName: "Adaeze", lastName: "Obi", phone: "0800" }));
  });
});
