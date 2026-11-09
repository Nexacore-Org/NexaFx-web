import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { KycWizard } from "./kyc-wizard";
import * as kycApi from "@/lib/api/kyc";

vi.mock("@/lib/api/kyc", () => ({
  uploadKycDocument: vi.fn(),
  submitKycDocuments: vi.fn(),
}));

function createMockFile(name: string, type: string = "image/jpeg"): File {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  return new File([bytes], name, { type });
}

describe("KycWizard Step Validation (Issue #1240)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(
      () => "blob:http://localhost/preview",
    );
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("disables Next on ID, Selfie, and Address steps until required file is uploaded", async () => {
    const onClose = vi.fn();
    const onComplete = vi.fn();

    render(
      <KycWizard
        open={true}
        onClose={onClose}
        onComplete={onComplete}
        defaultMethod="document"
      />,
    );

    // Step 0: Choose Method
    const nextBtn = screen.getByRole("button", { name: /^next$/i });
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    // Advance to Step 1: ID Document
    fireEvent.click(nextBtn);
    const dropzone1 = screen.getByRole("button", {
      name: /upload government id document/i,
    });
    expect(dropzone1).toBeTruthy();

    // Verification 1: Next is DISABLED on Step 1 without an ID file
    expect(nextBtn.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText(
        /please upload your government id document before proceeding/i,
      ),
    ).toBeTruthy();

    // Upload ID file
    const idFile = createMockFile("passport.jpg");
    fireEvent.drop(dropzone1, {
      dataTransfer: { files: [idFile] },
    });

    await waitFor(() => {
      expect(nextBtn.hasAttribute("disabled")).toBe(false);
    });

    // Advance to Step 2: Selfie
    fireEvent.click(nextBtn);
    const dropzone2 = screen.getByRole("button", {
      name: /upload selfie photo/i,
    });
    expect(dropzone2).toBeTruthy();

    // Verification 2: Next is DISABLED on Step 2 without a selfie file
    expect(nextBtn.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText(/please upload your selfie photo before proceeding/i),
    ).toBeTruthy();

    // Upload Selfie file
    const selfieFile = createMockFile("selfie.jpg");
    fireEvent.drop(dropzone2, {
      dataTransfer: { files: [selfieFile] },
    });

    await waitFor(() => {
      expect(nextBtn.hasAttribute("disabled")).toBe(false);
    });

    // Advance to Step 3: Proof of Address
    fireEvent.click(nextBtn);
    const dropzone3 = screen.getByRole("button", {
      name: /upload proof of address document/i,
    });
    expect(dropzone3).toBeTruthy();

    // Verification 3: Next is DISABLED on Step 3 without an address file
    expect(nextBtn.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText(
        /please upload your proof of address document before proceeding/i,
      ),
    ).toBeTruthy();

    // Upload Proof of Address file
    const addressFile = createMockFile("utility-bill.jpg");
    fireEvent.drop(dropzone3, {
      dataTransfer: { files: [addressFile] },
    });

    await waitFor(() => {
      expect(nextBtn.hasAttribute("disabled")).toBe(false);
    });

    // Advance to Step 4: Review & Submit
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Review your documents/i)).toBeTruthy();

    // Verification 4: Submit for Review is DISABLED without consent checkbox
    const submitBtn = screen.getByRole("button", {
      name: /submit for review/i,
    });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText(/please agree to the verification terms to submit/i),
    ).toBeTruthy();

    // Check consent checkbox
    const consentCheckbox = screen.getByRole("checkbox");
    fireEvent.click(consentCheckbox);

    // Now Submit for Review is ENABLED
    expect(submitBtn.hasAttribute("disabled")).toBe(false);

    // Mock API upload responses
    vi.mocked(kycApi.uploadKycDocument)
      .mockResolvedValueOnce({ id: "doc-1" })
      .mockResolvedValueOnce({ id: "doc-2" })
      .mockResolvedValueOnce({ id: "doc-3" });

    vi.mocked(kycApi.submitKycDocuments).mockResolvedValueOnce({
      status: "pending",
      rejectionReason: null,
    } as unknown as kycApi.KycStatusResponse);

    // Submit documents
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(kycApi.uploadKycDocument).toHaveBeenCalledTimes(3);
      expect(kycApi.submitKycDocuments).toHaveBeenCalledWith({
        documentIds: ["doc-1", "doc-2", "doc-3"],
      });
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
