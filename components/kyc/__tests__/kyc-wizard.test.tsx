import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KycWizard } from "@/components/kyc/kyc-wizard";

vi.mock("@/lib/api/kyc", () => ({
  uploadKycDocument: vi.fn(),
  submitKycDocuments: vi.fn(),
}));

describe("KycWizard method selector radio-group pattern", () => {
  afterEach(cleanup);

  it("ensures only the selected method is tabbable (tabIndex=0) and others are tabIndex=-1", () => {
    render(
      <KycWizard
        open={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        defaultMethod="bvn"
      />,
    );

    const radiogroup = screen.getByRole("radiogroup", {
      name: "Verification Method",
    });
    expect(radiogroup).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);

    // BVN is selected by default
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("tabindex", "0");

    // NIN and Document are not selected
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");

    expect(radios[2]).toHaveAttribute("aria-checked", "false");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
  });

  it("moves selection and focus with ArrowDown and ArrowRight, wrapping around", () => {
    render(
      <KycWizard
        open={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        defaultMethod="bvn"
      />,
    );

    const radios = screen.getAllByRole("radio");
    radios[0].focus();
    expect(document.activeElement).toBe(radios[0]);

    // ArrowDown moves to NIN (index 1)
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("tabindex", "0");
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(radios[1]);

    // ArrowRight moves to Document (index 2)
    fireEvent.keyDown(radios[1], { key: "ArrowRight" });
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(radios[2]).toHaveAttribute("tabindex", "0");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(radios[2]);

    // ArrowDown wraps around to BVN (index 0)
    fireEvent.keyDown(radios[2], { key: "ArrowDown" });
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[2]).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toBe(radios[0]);
  });

  it("moves selection and focus with ArrowUp and ArrowLeft, wrapping around", () => {
    render(
      <KycWizard
        open={true}
        onClose={vi.fn()}
        onComplete={vi.fn()}
        defaultMethod="bvn"
      />,
    );

    const radios = screen.getAllByRole("radio");
    radios[0].focus();

    // ArrowUp on first item wraps to Document (index 2)
    fireEvent.keyDown(radios[0], { key: "ArrowUp" });
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(radios[2]).toHaveAttribute("tabindex", "0");
    expect(document.activeElement).toBe(radios[2]);

    // ArrowLeft on Document moves to NIN (index 1)
    fireEvent.keyDown(radios[2], { key: "ArrowLeft" });
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("tabindex", "0");
    expect(document.activeElement).toBe(radios[1]);
  });

  it("resets selected method to defaultMethod on wizard close", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <KycWizard
        open={true}
        onClose={onClose}
        onComplete={vi.fn()}
        defaultMethod="bvn"
      />,
    );

    const radios = screen.getAllByRole("radio");
    // Change selection to document (index 2)
    fireEvent.click(radios[2]);
    expect(radios[2]).toHaveAttribute("aria-checked", "true");

    // Close modal via close button
    const closeBtn = screen.getByRole("button", { name: "Close dialog" });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();

    // Reopen modal
    rerender(
      <KycWizard
        open={true}
        onClose={onClose}
        onComplete={vi.fn()}
        defaultMethod="bvn"
      />,
    );

    // Selected method must be reset to bvn
    const newRadios = screen.getAllByRole("radio");
    expect(newRadios[0]).toHaveAttribute("aria-checked", "true");
    expect(newRadios[0]).toHaveAttribute("tabindex", "0");
    expect(newRadios[2]).toHaveAttribute("aria-checked", "false");
    expect(newRadios[2]).toHaveAttribute("tabindex", "-1");
  });
});
