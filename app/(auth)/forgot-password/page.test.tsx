import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/msw-server";
import ForgotPasswordPage from "./page";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/forgot-password",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  push.mockClear();
  sessionStorage.clear();
});

describe("ForgotPasswordPage", () => {
  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      "not-an-email"
    );
    await user.click(screen.getByRole("button", { name: /send reset code/i }));

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  it("submits the email and shows a generic confirmation that does not reveal account existence", async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post("*/auth/forgot-password", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: "ok" });
      })
    );

    render(<ForgotPasswordPage />);
    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      "ada@example.com"
    );
    await user.click(screen.getByRole("button", { name: /send reset code/i }));

    const confirmation = await screen.findByText(
      /if an account exists for this email/i
    );
    expect(confirmation).toBeInTheDocument();
    expect(body).toEqual({ email: "ada@example.com" });
    // The generic message must not echo the submitted email — no existence leak.
    expect(confirmation.textContent).not.toContain("ada@example.com");
    expect(sessionStorage.getItem("reset-password-email")).toBe(
      "ada@example.com"
    );
  });

  it("keeps the success message generic even when the email is unknown", async () => {
    const user = userEvent.setup();
    // A secure backend returns 200 whether or not the address exists, so the
    // UI shows the same confirmation either way.
    server.use(
      http.post("*/auth/forgot-password", () =>
        HttpResponse.json({ message: "ok" })
      )
    );

    render(<ForgotPasswordPage />);
    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      "nobody@example.com"
    );
    await user.click(screen.getByRole("button", { name: /send reset code/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/if an account exists for this email/i)
      ).toBeInTheDocument()
    );
    expect(screen.queryByText(/not found/i)).not.toBeInTheDocument();
  });
});
