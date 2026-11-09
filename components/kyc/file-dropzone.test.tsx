import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { FileDropzone } from "./file-dropzone";
import { useState } from "react";

function createMockFile(
  name: string,
  type: string,
  magicBytes: number[],
  sizeBytes: number = 1024,
): File {
  const bytes = new Uint8Array(Math.max(magicBytes.length, sizeBytes));
  for (let i = 0; i < magicBytes.length; i++) {
    bytes[i] = magicBytes[i]!;
  }
  return new File([bytes], name, { type });
}

describe("FileDropzone Component (Issue #1241)", () => {
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();

  beforeEach(() => {
    mockCreateObjectURL.mockReset();
    mockRevokeObjectURL.mockReset();
    mockCreateObjectURL.mockReturnValue(
      "blob:http://localhost/mock-preview-url",
    );
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("links the label to the input element via htmlFor and matching id", () => {
    render(
      <FileDropzone
        label="Selfie Photo"
        accept="image/jpeg,image/png"
        value={null}
        onChange={() => {}}
      />,
    );

    const label = screen.getByText("Selfie Photo");
    expect(label.tagName.toLowerCase()).toBe("label");
    const htmlFor = label.getAttribute("for");
    expect(htmlFor).toBeTruthy();

    const input = document.getElementById(htmlFor!);
    expect(input).toBeTruthy();
    expect(input?.tagName.toLowerCase()).toBe("input");
    expect(input?.getAttribute("type")).toBe("file");
    expect(input?.getAttribute("accept")).toBe("image/jpeg,image/png");
  });

  it("rejects dropping a PDF on a dropzone configured with accept='image/jpeg,image/png'", async () => {
    const onChange = vi.fn();
    const pdfFile = createMockFile(
      "selfie.pdf",
      "application/pdf",
      [0x25, 0x50, 0x44, 0x46],
    );

    render(
      <FileDropzone
        label="Selfie Photo"
        accept="image/jpeg,image/png"
        value={null}
        onChange={onChange}
      />,
    );

    const dropzone = screen.getByRole("button", {
      name: /upload selfie photo/i,
    });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [pdfFile],
      },
    });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
    });

    expect(screen.getByRole("alert").textContent).toMatch(/invalid file type/i);
    expect(screen.getByRole("alert").textContent).toMatch(/jpg or png/i);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepts dropping a valid JPEG on selfie dropzone", async () => {
    const onChange = vi.fn();
    const jpgFile = createMockFile(
      "selfie.jpg",
      "image/jpeg",
      [0xff, 0xd8, 0xff, 0xe0],
    );

    render(
      <FileDropzone
        label="Selfie Photo"
        accept="image/jpeg,image/png"
        value={null}
        onChange={onChange}
      />,
    );

    const dropzone = screen.getByRole("button", {
      name: /upload selfie photo/i,
    });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [jpgFile],
      },
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(jpgFile);
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("derives preview URL from value with useMemo and survives step navigation", () => {
    const jpgFile = createMockFile(
      "my-portrait.png",
      "image/png",
      [0x89, 0x50, 0x4e, 0x47],
    );

    function StepNavigator() {
      const [step, setStep] = useState<number>(1);
      const [file, setFile] = useState<File | null>(jpgFile);

      return (
        <div>
          <button onClick={() => setStep(step === 1 ? 2 : 1)}>
            Toggle Step
          </button>
          {step === 1 ? (
            <FileDropzone
              label="Selfie Photo"
              accept="image/jpeg,image/png"
              value={file}
              onChange={setFile}
            />
          ) : (
            <div>Step 2 - Other Form</div>
          )}
        </div>
      );
    }

    render(<StepNavigator />);

    // Step 1: Preview rendered with file name as alt text
    const img = screen.getByRole("img");
    expect(img).toBeTruthy();
    expect(img.getAttribute("alt")).toBe("my-portrait.png");
    expect(img.getAttribute("src")).toBe(
      "blob:http://localhost/mock-preview-url",
    );

    // Navigate to step 2 (dropzone unmounts)
    fireEvent.click(screen.getByText("Toggle Step"));
    expect(screen.getByText("Step 2 - Other Form")).toBeTruthy();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith(
      "blob:http://localhost/mock-preview-url",
    );

    // Navigate back to step 1 (dropzone remounts with retained value)
    fireEvent.click(screen.getByText("Toggle Step"));
    const restoredImg = screen.getByRole("img");
    expect(restoredImg.getAttribute("alt")).toBe("my-portrait.png");
    expect(restoredImg.getAttribute("src")).toBe(
      "blob:http://localhost/mock-preview-url",
    );
  });

  it("shows PDF placeholder when uploaded file is a PDF", () => {
    const pdfFile = createMockFile(
      "utility-bill.pdf",
      "application/pdf",
      [0x25, 0x50, 0x44, 0x46],
    );

    render(
      <FileDropzone
        label="Proof of Address"
        accept="image/jpeg,image/png,application/pdf"
        value={pdfFile}
        onChange={() => {}}
      />,
    );

    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("PDF")).toBeTruthy();
    expect(screen.getByText("utility-bill.pdf")).toBeTruthy();
  });

  it("removes file and clears error and input value when Remove file is clicked", () => {
    const onChange = vi.fn();
    const jpgFile = createMockFile(
      "photo.jpg",
      "image/jpeg",
      [0xff, 0xd8, 0xff, 0xe0],
    );

    render(<FileDropzone label="Photo" value={jpgFile} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /remove file/i }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });
});
