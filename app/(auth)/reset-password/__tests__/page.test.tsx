import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import { resetPassword } from "@/lib/api/auth";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn(() => "test@example.com") }),
}));

jest.mock("@/lib/api/auth", () => ({
  resetPassword: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe("ResetPasswordPage OTP Entry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resetPassword as jest.Mock).mockResolvedValue(undefined);
  });

  const renderPage = () => {
    return render(<ResetPasswordPage />);
  };

  it("auto-advances focus when typing a digit", async () => {
    const user = userEvent.setup();
    renderPage();

    const inputs = screen.getAllByRole("textbox", { name: /digit/i });
    expect(inputs).toHaveLength(6);

    await user.type(inputs[0], "1");
    await waitFor(() => expect(inputs[1]).toHaveFocus());

    await user.type(inputs[1], "2");
    await waitFor(() => expect(inputs[2]).toHaveFocus());
  });

  it("fills all inputs correctly when pasting a full 6-digit code", async () => {
    const user = userEvent.setup();
    renderPage();

    const inputs = screen.getAllByRole("textbox", { name: /digit/i });
    const firstInput = inputs[0];

    await user.click(firstInput);
    await user.keyboard("[Control>]v[/Control]");

    await waitFor(() => {
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("3");
      expect(inputs[3]).toHaveValue("4");
      expect(inputs[4]).toHaveValue("5");
      expect(inputs[5]).toHaveValue("6");
    });
  });

  it("moves focus to previous input on Backspace when current is empty", async () => {
    const user = userEvent.setup();
    renderPage();

    const inputs = screen.getAllByRole("textbox", { name: /digit/i });

    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await waitFor(() => expect(inputs[2]).toHaveFocus());

    await user.keyboard("{backspace}");
    await waitFor(() => expect(inputs[1]).toHaveFocus());

    await user.keyboard("{backspace}");
    await waitFor(() => expect(inputs[0]).toHaveFocus());
  });
});