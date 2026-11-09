import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { IdentityNumberStep } from "../identity-number-step";
import { BvnStep } from "../bvn-step";
import { NinStep } from "../nin-step";
import { IdentityVerificationError } from "@/lib/api/kyc";

describe("IdentityNumberStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("defaults to masked and sets autoComplete='off'", () => {
    render(<IdentityNumberStep kind="bvn" onSuccess={vi.fn()} />);

    const input = screen.getByLabelText(/Bank Verification Number/i);
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  it("toggles masking state, updates aria-pressed and aria-label", () => {
    render(<IdentityNumberStep kind="bvn" onSuccess={vi.fn()} />);

    const input = screen.getByLabelText(/Bank Verification Number/i);
    expect(input).toHaveAttribute("type", "password");

    // Toggle button should not be visible when input is empty
    expect(screen.queryByRole("button", { name: /show/i })).not.toBeInTheDocument();

    // Type a number
    fireEvent.change(input, { target: { value: "12345678901" } });

    // Toggle button appears, starts with aria-pressed="true" (masked) and accessible name "Show"
    const showButton = screen.getByRole("button", { name: "Show" });
    expect(showButton).toHaveAttribute("aria-pressed", "true");
    expect(showButton).toHaveAttribute("aria-label", "Show");

    // Click to unmask
    fireEvent.click(showButton);
    expect(input).toHaveAttribute("type", "text");

    const maskButton = screen.getByRole("button", { name: "Mask" });
    expect(maskButton).toHaveAttribute("aria-pressed", "false");
    expect(maskButton).toHaveAttribute("aria-label", "Mask");

    // When unmasked and length 11, preview appears
    expect(screen.getByText(/Preview: •••••••8901/)).toBeInTheDocument();

    // Click to mask again
    fireEvent.click(maskButton);
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show" })).toHaveAttribute("aria-pressed", "true");
  });

  it("restricts input to 11 numeric digits", () => {
    render(<IdentityNumberStep kind="bvn" onSuccess={vi.fn()} />);

    const input = screen.getByLabelText(/Bank Verification Number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc 123-456 7890123 extra" } });

    expect(input.value).toBe("12345678901");
  });

  it("submits valid 11-digit BVN and clears input state on success", async () => {
    const onSuccess = vi.fn();
    const mockSubmit = vi.fn().mockResolvedValue({ status: "approved" });

    render(
      <IdentityNumberStep
        kind="bvn"
        onSuccess={onSuccess}
        submitFn={mockSubmit}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: "Verify BVN" });
    expect(submitBtn).toBeDisabled();

    const input = screen.getByLabelText(/Bank Verification Number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "12345678901" } });

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("12345678901");
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(input.value).toBe("");
    });
  });

  it("submits valid NIN and handles NIN specific labels", async () => {
    const onSuccess = vi.fn();
    const mockSubmit = vi.fn().mockResolvedValue({ status: "approved" });

    render(
      <IdentityNumberStep
        kind="nin"
        onSuccess={onSuccess}
        submitFn={mockSubmit}
      />,
    );

    expect(screen.getByLabelText(/National Identification Number/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: "Verify NIN" });
    expect(submitBtn).toBeDisabled();

    const input = screen.getByLabelText(/National Identification Number/i);
    fireEvent.change(input, { target: { value: "98765432109" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("98765432109");
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("handles fallback to documents error gracefully", async () => {
    const onFallback = vi.fn();
    const mockSubmit = vi.fn().mockRejectedValue(
      new IdentityVerificationError("provider_unavailable", "Provider outage"),
    );

    render(
      <IdentityNumberStep
        kind="bvn"
        onSuccess={vi.fn()}
        onFallbackToDocuments={onFallback}
        submitFn={mockSubmit}
      />,
    );

    const input = screen.getByLabelText(/Bank Verification Number/i);
    fireEvent.change(input, { target: { value: "12345678901" } });

    const submitBtn = screen.getByRole("button", { name: "Verify BVN" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Provider outage");
    });

    const fallbackBtn = screen.getByRole("button", {
      name: /Verify with documents \(ID & selfie\) instead/i,
    });
    fireEvent.click(fallbackBtn);
    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  it("displays generic error on unexpected failure", async () => {
    const mockSubmit = vi.fn().mockRejectedValue(new Error("Network failed"));

    render(
      <IdentityNumberStep
        kind="nin"
        onSuccess={vi.fn()}
        submitFn={mockSubmit}
      />,
    );

    const input = screen.getByLabelText(/National Identification Number/i);
    fireEvent.change(input, { target: { value: "12345678901" } });

    const submitBtn = screen.getByRole("button", { name: "Verify NIN" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "We could not verify your NIN at this time. Please try again.",
      );
    });
  });

  it("preserves backwards compatibility via BvnStep and NinStep wrappers", () => {
    const { unmount: unmountBvn } = render(<BvnStep onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/Bank Verification Number/i)).toBeInTheDocument();
    unmountBvn();

    render(<NinStep onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/National Identification Number/i)).toBeInTheDocument();
  });
});
