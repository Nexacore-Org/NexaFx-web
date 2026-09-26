import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { VerificationModal } from "@/components/profile/verification-modal";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe("VerificationModal state transitions", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderModal = (isOpen = true) => {
    return render(<VerificationModal isOpen={isOpen} onClose={mockOnClose} />);
  };

  it("renders nothing when isOpen is false", () => {
    renderModal(false);
    expect(screen.queryByText(/account verification/i)).not.toBeInTheDocument();
  });

  it("renders idle state with form fields when opened", () => {
    renderModal(true);

    expect(screen.getByText(/account verification/i)).toBeInTheDocument();
    expect(screen.getByText(/verify now/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/myname/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/lastname/i)).toBeInTheDocument();
  });

  it("shows loading state and transitions to success when Verify Now is clicked", async () => {
    renderModal(true);

    const verifyButton = screen.getByRole("button", { name: /verify now/i });
    fireEvent.click(verifyButton);

    // Should show loading state
    expect(screen.getByText(/verifying.../i)).toBeInTheDocument();
    expect(verifyButton).toBeDisabled();

    // Advance timers past the 1500ms delay
    await act(async () => {
      jest.advanceTimersByTime(1500);
      await Promise.resolve();
    });

    // Should show success state
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
  });

  it("Cancel button closes modal from idle state without triggering verification", async () => {
    renderModal(true);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Verify handleVerify was not called (no loading state)
    const verifyButton = screen.getByRole("button", { name: /verify now/i });
    expect(verifyButton).not.toBeDisabled();
  });

  it("does not allow Verify Now click while loading", async () => {
    renderModal(true);

    const verifyButton = screen.getByRole("button", { name: /verify now/i });
    fireEvent.click(verifyButton);

    // Button should be disabled during loading
    expect(verifyButton).toBeDisabled();

    // Clicking again should not cause issues
    fireEvent.click(verifyButton);
    expect(verifyButton).toBeDisabled();
  });
});