import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../lib/notify", () => ({ notify: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
vi.mock("../../lib/api/auth", async (orig) => {
  const real = await orig<typeof import("../../lib/api/auth")>();
  return { ...real, changePassword: vi.fn(async () => { throw new real.WrongPasswordError(); }) };
});
import ChangePasswordForm from "./change-password-form";

const setup = () => {
  const { container } = render(<QueryClientProvider client={new QueryClient()}><ChangePasswordForm /></QueryClientProvider>);
  const field = (id: string) => container.querySelector(`#${id}`) as HTMLInputElement;
  const submit = screen.getByRole("button", { name: "Change password" }) as HTMLButtonElement;
  return { field, submit };
};

describe("ChangePasswordForm", () => {
  it("blocks same-as-current and mismatched confirmation", () => {
    const { field, submit } = setup();
    fireEvent.change(field("current-password"), { target: { value: "Str0ng!Passw0rd" } });
    fireEvent.change(field("new-password"), { target: { value: "Str0ng!Passw0rd" } });
    fireEvent.change(field("confirm-password"), { target: { value: "Str0ng!Passw0rd" } });
    expect(submit.disabled).toBe(true);
    fireEvent.change(field("new-password"), { target: { value: "An0ther!Passw0rd" } });
    expect(submit.disabled).toBe(true);
  });

  it("focuses the current password after WrongPasswordError", async () => {
    const { field, submit } = setup();
    fireEvent.change(field("current-password"), { target: { value: "wrong-one" } });
    fireEvent.change(field("new-password"), { target: { value: "An0ther!Passw0rd" } });
    fireEvent.change(field("confirm-password"), { target: { value: "An0ther!Passw0rd" } });
    fireEvent.click(submit);
    await waitFor(() => expect(document.activeElement).toBe(field("current-password")));
    expect(field("new-password").value).toBe("An0ther!Passw0rd");
  });
});
