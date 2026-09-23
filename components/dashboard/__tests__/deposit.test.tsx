import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DepositMethods } from "@/components/dashboard/deposit";
import { getProfile } from "@/lib/api/users";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn(() => null) }),
}));

jest.mock("@/lib/api/users", () => ({
  getProfile: jest.fn(),
}));

jest.mock("@/hooks/use-focus-trap", () => ({
  useFocusTrap: jest.fn(),
}));

jest.mock("@/components/dashboard/notification", () => ({
  MobileNotificationBanner: ({ children }: any) => <div data-testid="notification">{children}</div>,
}));

jest.mock("@/components/dashboard/InstantDepositModal", () => ({
  __esModule: true,
  default: ({ isMobile, onClose }: any) => <div data-testid="instant-modal" onClick={onClose}>Instant Modal</div>,
}));

describe("DepositMethods - MoonPay error state and disabled button", () => {
  const mockToggleDeposit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getProfile as jest.Mock).mockResolvedValue({ walletAddress: "0x123" });
    process.env.NEXT_PUBLIC_MOONPAY_API_KEY = "test-key";
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_MOONPAY_API_KEY;
  });

  const renderComponent = () => {
    return render(<DepositMethods toggleDeposit={mockToggleDeposit} />);
  };

  it("disables MoonPay button while walletAddress is loading (null)", async () => {
    (getProfile as jest.Mock).mockImplementation(() => new Promise(() => {})); // never resolves

    renderComponent();

    const moonPayButton = screen.getByRole("button", { name: /buy crypto.*moonpay/i });
    await waitFor(() => {
      expect(moonPayButton).toBeDisabled();
      expect(moonPayButton).toHaveAttribute("title", "Wallet address is loading…");
    });
  });

  it("enables MoonPay button once walletAddress is loaded", async () => {
    (getProfile as jest.Mock).mockResolvedValue({ walletAddress: "0x123" });

    renderComponent();

    const moonPayButton = screen.getByRole("button", { name: /buy crypto.*moonpay/i });
    await waitFor(() => {
      expect(moonPayButton).not.toBeDisabled();
    });
  });

  it("shows error banner when MoonPay API key is missing", async () => {
    delete process.env.NEXT_PUBLIC_MOONPAY_API_KEY;

    renderComponent();

    const moonPayButton = screen.getByRole("button", { name: /buy crypto.*moonpay/i });
    fireEvent.click(moonPayButton);

    await waitFor(() => {
      const errorBanner = screen.getByText(/moonpay is currently unavailable/i);
      expect(errorBanner).toBeInTheDocument();
    });
  });

  it("does not show error banner when MoonPay API key is present", async () => {
    process.env.NEXT_PUBLIC_MOONPAY_API_KEY = "test-key";

    renderComponent();

    const moonPayButton = screen.getByRole("button", { name: /buy crypto.*moonpay/i });
    fireEvent.click(moonPayButton);

    await waitFor(() => {
      const errorBanner = screen.queryByText(/moonpay is currently unavailable/i);
      expect(errorBanner).not.toBeInTheDocument();
    });
  });
});