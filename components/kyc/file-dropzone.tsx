"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
  type DragEvent,
  type ChangeEvent,
} from "react";

export interface FileDropzoneProps {
  label: string;
  description?: string;
  accept?: string;
  maxSizeMb?: number;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Checks magic bytes of the file to verify format beyond just the extension:
 * JPEG: FF D8 FF
 * PNG: 89 50 4E 47
 * PDF: 25 50 44 46 (%PDF)
 */
export async function detectFileSignature(file: File): Promise<string | null> {
  try {
    const slice = file.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image/jpeg";
    }
    // PNG
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return "image/png";
    }
    // PDF (%PDF)
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return "application/pdf";
    }

    return null;
  } catch {
    // If arrayBuffer reading fails, fall back to mime check
    if (["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      return file.type;
    }
    return null;
  }
}

export function isTypeAccepted(
  detectedType: string,
  accept: string,
  file: File,
): boolean {
  if (!accept || accept.trim() === "" || accept.trim() === "*") return true;

  const acceptedTokens = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const lowerDetected = detectedType.toLowerCase();
  const extension = file.name.includes(".")
    ? `.${file.name.split(".").pop()?.toLowerCase()}`
    : "";

  return acceptedTokens.some((token) => {
    if (token === lowerDetected) return true;

    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1);
      if (lowerDetected.startsWith(prefix)) return true;
    }

    if (token.startsWith(".")) {
      if (token === extension) return true;
      if (
        (token === ".jpg" || token === ".jpeg") &&
        lowerDetected === "image/jpeg"
      ) {
        return true;
      }
      if (token === ".png" && lowerDetected === "image/png") {
        return true;
      }
      if (token === ".pdf" && lowerDetected === "application/pdf") {
        return true;
      }
    }

    return false;
  });
}

function formatAcceptErrorMessage(accept: string): string {
  const tokens = accept.split(",").map((s) => s.trim().toLowerCase());
  const formats: string[] = [];
  if (tokens.some((t) => t.includes("jpeg") || t.includes("jpg")))
    formats.push("JPG");
  if (tokens.some((t) => t.includes("png"))) formats.push("PNG");
  if (tokens.some((t) => t.includes("pdf"))) formats.push("PDF");

  if (formats.length === 2) {
    return `Invalid file type. Please upload a valid ${formats[0]} or ${formats[1]}.`;
  }
  if (formats.length > 2) {
    return `Invalid file type. Please upload a valid ${formats.slice(0, -1).join(", ")}, or ${formats[formats.length - 1]}.`;
  }
  return "Invalid file type. Please upload a valid JPG, PNG, or PDF.";
}

export function FileDropzone({
  label,
  description = "Supported formats: JPG, PNG, PDF (max 5 MB)",
  accept = "image/jpeg,image/png,application/pdf",
  maxSizeMb = 5,
  value,
  onChange,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = `file-dropzone-${generatedId.replace(/:/g, "")}`;

  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const previewUrl = useMemo(() => {
    if (!value) return null;
    if (
      value.type.startsWith("image/") ||
      value.type === "image/jpeg" ||
      value.type === "image/png" ||
      /\.(jpe?g|png)$/i.test(value.name)
    ) {
      try {
        return URL.createObjectURL(value);
      } catch {
        return null;
      }
    }
    return null;
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleValidateAndSelect = useCallback(
    async (file: File) => {
      setErrorMessage(null);

      // Check size
      if (file.size > maxSizeBytes) {
        setErrorMessage(`File is too large. Maximum size is ${maxSizeMb} MB.`);
        return;
      }

      // Check mime type & magic numbers
      const detectedType = await detectFileSignature(file);
      if (!detectedType || !isTypeAccepted(detectedType, accept, file)) {
        setErrorMessage(formatAcceptErrorMessage(accept));
        return;
      }

      onChange(file);
    },
    [accept, maxSizeBytes, maxSizeMb, onChange],
  );

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0]) {
      await handleValidateAndSelect(files[0]);
    }
  };

  const onFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      await handleValidateAndSelect(files[0]);
    }
  };

  const onRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onChange(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {label}
        </label>
        {value && !disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400"
          >
            Remove file
          </button>
        )}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {!value ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label={`Upload ${label}`}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <svg
            className="mb-2 h-8 w-8 text-zinc-400 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Click to upload or drag & drop
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={value.name}
              className="h-14 w-14 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              PDF
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {value.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {(value.size / (1024 * 1024)).toFixed(2)} MB •{" "}
              {value.type || "Document"}
            </p>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Replace
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
