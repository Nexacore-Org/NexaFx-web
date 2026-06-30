import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "@/components/ui/copy-button";

const { showToastMock, copyMock } = vi.hoisted(() => ({
  showToastMock: vi.fn(),
  copyMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/hooks/use-toast", () => ({
  showToast: showToastMock,
}));

vi.mock("@/hooks/use-clipboard", () => ({
  useClipboard: () => ({
    copied: false,
    copy: copyMock,
  }),
}));

describe("CopyButton", () => {
  it("renders an accessible button", () => {
    render(<CopyButton value="abc" label="Copy wallet address" />);

    expect(screen.getByRole("button", { name: /copy wallet address/i })).toBeInTheDocument();
  });

  it("shows a failure toast when copying fails", async () => {
    copyMock.mockResolvedValue(false);

    render(<CopyButton value="abc" label="Copy wallet address" />);

    fireEvent.click(screen.getByRole("button", { name: /copy wallet address/i }));

    await waitFor(() => {
      expect(showToastMock).toHaveBeenCalledWith("Failed to copy");
    });
  });
});
