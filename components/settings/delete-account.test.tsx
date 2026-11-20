import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("../../lib/api/user", async (orig) => {
  const real = await orig<typeof import("../../lib/api/user")>();
  return {
    ...real,
    deleteAccount: vi.fn(async () => {
      throw new real.AccountDeletionBlockedError([{ code: "non_zero_balance", message: "Withdraw your NGN balance first." } as never]);
    }),
  };
});
import DeleteAccount from "./delete-account";

describe("DeleteAccount", () => {
  it("requires the DELETE phrase and a password, then shows blockers", async () => {
    const { container } = render(<QueryClientProvider client={new QueryClient()}><DeleteAccount /></QueryClientProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    const confirm = screen.getByRole("button", { name: "Permanently delete my account" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(container.ownerDocument.querySelector("#delete-confirmation")!, { target: { value: "delete" } });
    fireEvent.change(container.ownerDocument.querySelector("#delete-password")!, { target: { value: "pw" } });
    expect(confirm.disabled).toBe(true);
    fireEvent.change(container.ownerDocument.querySelector("#delete-confirmation")!, { target: { value: "DELETE" } });
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    expect(await screen.findByText("Withdraw your NGN balance first.")).toBeTruthy();
  });
});
