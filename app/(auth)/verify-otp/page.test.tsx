import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/__tests__/msw-server";
import VerifyOtpPage from "./page";

const { push, replace } = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/verify-otp",
  useSearchParams: () => new URLSearchParams(),
}));

const seedEmail = () =>
  sessionStorage.setItem("login-email", "ada@example.com");

const fillOtp = async (
  user: ReturnType<typeof userEvent.setup>,
  code = "123456"
) => {
  const first = screen.getByLabelText("OTP digit 1");
  await user.click(first);
  await user.paste(code);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /proceed/i })).toBeEnabled()
  );
};

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
  sessionStorage.clear();
});

describe("VerifyOtpPage", () => {
  it("redirects to /login when there is no email in sessionStorage", async () => {
    render(<VerifyOtpPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("verifies the OTP with { email, otp } and redirects home on success", async () => {
    seedEmail();
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post("*/auth/verify-login-otp", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          user: {
            id: "u1",
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@example.com",
            role: "USER",
          },
          accessToken: "access-1",
          refreshToken: "refresh-1",
        });
      })
    );

    render(<VerifyOtpPage />);
    await fillOtp(user);
    await user.click(screen.getByRole("button", { name: /proceed/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(body).toEqual({ email: "ada@example.com", otp: "123456" });
    expect(sessionStorage.getItem("login-email")).toBeNull();
  });

  it("shows an error when the OTP is rejected", async () => {
    seedEmail();
    const user = userEvent.setup();
    server.use(
      http.post("*/auth/verify-login-otp", () =>
        HttpResponse.json({ message: "Invalid OTP" }, { status: 400 })
      )
    );

    render(<VerifyOtpPage />);
    await fillOtp(user);
    await user.click(screen.getByRole("button", { name: /proceed/i }));

    expect(await screen.findByText(/invalid otp/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("resends the login OTP when Resend is clicked", async () => {
    seedEmail();
    const user = userEvent.setup();
    let called = false;
    server.use(
      http.post("*/auth/resend-login-otp", () => {
        called = true;
        return HttpResponse.json({ message: "sent" });
      })
    );

    render(<VerifyOtpPage />);
    const resendButton = await screen.findByRole("button", { name: /resend/i });
    await waitFor(() => expect(resendButton).toBeEnabled());
    await user.click(resendButton);

    await waitFor(() => expect(called).toBe(true));
    expect(
      await screen.findByText(/a new code has been sent/i)
    ).toBeInTheDocument();
  });
});
