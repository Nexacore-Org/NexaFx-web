import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { KycWizard } from "../kyc-wizard";

describe("KycWizard document upload errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders wizard dialog when open=true", () => {
    render(
      <KycWizard
        open={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        defaultMethod="document"
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
