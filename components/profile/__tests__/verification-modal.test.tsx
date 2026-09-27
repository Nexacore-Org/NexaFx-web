import { render, screen, fireEvent } from "@testing-library/react";
import { VerificationModal } from "@/components/profile/verification-modal";
import { useAuthStore } from "@/hooks/use-auth-store";

jest.mock("@/hooks/use-auth-store", () => ({
  useAuthStore: jest.fn(),
}));

const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

function mockUser(user: Record<string, unknown> | null) {
  mockedUseAuthStore.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ user }),
  );
}

// Uploads a PNG to the first (only) file input on the current step.
function uploadPng() {
  const input = document.body.querySelector('input[type="file"]')!;
  const file = new File(["x"], "doc.png", { type: "image/png" });
  fireEvent.change(input, { target: { files: [file] } });
}

// Passport needs no back side, so the flow is: type → front → selfie → review.
function goToReviewStep() {
  fireEvent.click(screen.getByRole("button", { name: /passport/i }));
  uploadPng();
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
  uploadPng();
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
}

describe("VerificationModal", () => {
  const mockOnClose = jest.fn();

  beforeAll(() => {
    // jsdom does not implement object URLs, used by the selfie preview.
    URL.createObjectURL = jest.fn(() => "blob:preview");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    mockUser(null);
    render(<VerificationModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText(/account verification/i)).not.toBeInTheDocument();
  });

  it("starts on document type selection", () => {
    mockUser(null);
    render(<VerificationModal isOpen onClose={mockOnClose} />);
    expect(screen.getByText(/select document type/i)).toBeInTheDocument();
  });

  it("shows the authenticated user's real details on the review step", () => {
    mockUser({ firstName: "Ada", lastName: "Obi", email: "ada@example.com" });
    render(<VerificationModal isOpen onClose={mockOnClose} />);
    goToReviewStep();

    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Obi")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("never falls back to hardcoded placeholder identity data", () => {
    mockUser(null);
    render(<VerificationModal isOpen onClose={mockOnClose} />);
    goToReviewStep();

    expect(screen.queryByText(/myname|lastname|cersei414|houseaddress/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/not provided/i)).toHaveLength(3);
  });

  it("Cancel closes the modal", () => {
    mockUser(null);
    render(<VerificationModal isOpen onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
