import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import VerifyOtpPage from "./page";
import { mockPush } from "@/test/mocks/navigation";
import { server } from "@/test/msw/server";

const mockSetAuth = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-auth-store", () => ({
  useAuthStore: (
    selector: (state: { setAuth: typeof mockSetAuth }) => unknown,
  ) => selector({ setAuth: mockSetAuth }),
}));

const authResponse = {
  user: { id: "user-1", email: "user@example.com" },
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

function renderWithEmail() {
  sessionStorage.setItem("login-email", "user@example.com");
  render(<VerifyOtpPage />);
}

async function submitOtp(otp = "123456") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("One-time password"), otp);
  await user.click(screen.getByRole("button", { name: "Verify code" }));
}

describe("VerifyOtpPage", () => {
  it("reads the email from sessionStorage", async () => {
    renderWithEmail();

    expect(
      await screen.findByText(/user@example\.com/),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem).toHaveBeenCalledWith("login-email");
  });

  it("calls POST /auth/verify-login-otp with email and otp", async () => {
    const requests: unknown[] = [];
    server.use(
      http.post("*/api/proxy/auth/verify-login-otp", async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json(authResponse);
      }),
    );
    renderWithEmail();

    await submitOtp();

    await waitFor(() => {
      expect(requests).toEqual([
        { email: "user@example.com", otp: "123456" },
      ]);
    });
  });

  it("calls setAuth in the auth store on success", async () => {
    server.use(
      http.post("*/api/proxy/auth/verify-login-otp", () =>
        HttpResponse.json(authResponse),
      ),
    );
    renderWithEmail();

    await submitOtp();

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        authResponse.user,
        "access-token",
        "refresh-token",
      );
    });
  });

  it("redirects to /dashboard on success", async () => {
    server.use(
      http.post("*/api/proxy/auth/verify-login-otp", () =>
        HttpResponse.json(authResponse),
      ),
    );
    renderWithEmail();

    await submitOtp();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it('shows an "Invalid OTP" error on a 4xx response', async () => {
    server.use(
      http.post("*/api/proxy/auth/verify-login-otp", () =>
        HttpResponse.json({ message: "Invalid OTP" }, { status: 400 }),
      ),
    );
    renderWithEmail();

    await submitOtp();

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid OTP");
  });

  it("clears the OTP input after an error", async () => {
    server.use(
      http.post("*/api/proxy/auth/verify-login-otp", () =>
        HttpResponse.json({ message: "Invalid OTP" }, { status: 400 }),
      ),
    );
    renderWithEmail();
    const otpInput = screen.getByLabelText("One-time password");

    await submitOtp();

    await waitFor(() => {
      expect(otpInput).toHaveValue("");
    });
  });

  it("calls POST /auth/resend-signup-otp from the resend button", async () => {
    const requests: unknown[] = [];
    server.use(
      http.post("*/api/proxy/auth/resend-signup-otp", async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ message: "OTP resent" });
      }),
    );
    renderWithEmail();
    const user = userEvent.setup();

    await screen.findByText(/user@example\.com/);
    await user.click(screen.getByRole("button", { name: "Resend code" }));

    await waitFor(() => {
      expect(requests).toEqual([{ email: "user@example.com" }]);
    });
  });
});
