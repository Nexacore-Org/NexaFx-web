import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadKycDocument } from "../kyc";
import { ApiError } from "@/lib/api-client";

describe("uploadKycDocument", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("uploads to /api/kyc/documents with FormData and returns document id", async () => {
    const mockFile = new File(["dummy content"], "passport.pdf", {
      type: "application/pdf",
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ id: "doc_abc123" }),
    });
    global.fetch = mockFetch;

    const res = await uploadKycDocument({
      kind: "identity",
      file: mockFile,
    });

    expect(res).toEqual({ id: "doc_abc123" });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/kyc/documents");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.credentials).toBe("include");
    expect(init.signal).toBeDefined();

    const formData = init.body as FormData;
    expect(formData.get("kind")).toBe("identity");
    expect(formData.get("file")).toBe(mockFile);
  });

  it("throws ApiError with MISSING_DOCUMENT_ID when server returns empty id", async () => {
    const mockFile = new File(["dummy"], "selfie.jpg", { type: "image/jpeg" });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ id: "" }),
    });

    await expect(
      uploadKycDocument({
        kind: "selfie",
        file: mockFile,
      }),
    ).rejects.toThrow(ApiError);

    try {
      await uploadKycDocument({
        kind: "selfie",
        file: mockFile,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.code).toBe("MISSING_DOCUMENT_ID");
    }
  });

  it("parses server error response and surfaces specific message and code", async () => {
    const mockFile = new File(["dummy"], "id.png", { type: "image/png" });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({
        code: "FILE_TOO_LARGE",
        message: "The uploaded file exceeds the 5MB size limit.",
      }),
    });

    try {
      await uploadKycDocument({
        kind: "identity",
        file: mockFile,
      });
      expect.fail("Expected uploadKycDocument to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe("FILE_TOO_LARGE");
      expect(apiErr.message).toBe("The uploaded file exceeds the 5MB size limit.");
    }
  });

  it("parses plain text error responses when json is not returned", async () => {
    const mockFile = new File(["dummy"], "id.png", { type: "image/png" });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: new Headers({ "content-type": "text/plain" }),
      text: async () => "Bad Gateway: Storage service unreachable",
    });

    try {
      await uploadKycDocument({
        kind: "identity",
        file: mockFile,
      });
      expect.fail("Expected uploadKycDocument to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(502);
      expect(apiErr.message).toContain("Bad Gateway");
    }
  });

  it("combines caller signal and handles abort correctly", async () => {
    const mockFile = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
    const controller = new AbortController();

    global.fetch = vi.fn().mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => {
          const err = new DOMException("This operation was aborted", "AbortError");
          reject(err);
        });
      });
    });

    const uploadPromise = uploadKycDocument({
      kind: "proof_of_address",
      file: mockFile,
      signal: controller.signal,
    });

    // Abort after initiating
    controller.abort();

    await expect(uploadPromise).rejects.toThrow("This operation was aborted");
  });

  it("converts timeout into UPLOAD_TIMEOUT ApiError", async () => {
    const mockFile = new File(["dummy"], "doc.pdf", { type: "application/pdf" });

    global.fetch = vi.fn().mockRejectedValue(
      new DOMException("The operation was aborted due to timeout", "TimeoutError"),
    );

    try {
      await uploadKycDocument({
        kind: "proof_of_address",
        file: mockFile,
      });
      expect.fail("Expected uploadKycDocument to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.code).toBe("UPLOAD_TIMEOUT");
      expect(apiErr.message).toContain("Upload timed out");
      expect(apiErr.isNetworkError).toBe(true);
    }
  });
});
