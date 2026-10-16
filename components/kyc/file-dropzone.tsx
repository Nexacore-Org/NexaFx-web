"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
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
async function validateFileSignature(file: File): Promise<boolean> {
  try {
    const slice = file.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
      return true;
    // PNG
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    )
      return true;
    // PDF (%PDF)
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    )
      return true;

    return false;
  } catch {
    // If arrayBuffer reading fails, fall back to mime check
    return ["image/jpeg", "image/png", "application/pdf"].includes(file.type);
  }
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMb * 1024 * 1024;

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
      const isValid = await validateFileSignature(file);
      if (!isValid) {
        setErrorMessage(
          "Invalid file type. Please upload a valid JPG, PNG, or PDF.",
        );
        return;
      }

      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }

      onChange(file);
    },
    [maxSizeBytes, maxSizeMb, onChange],
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
    if (files && files.length > 0) {
      await handleValidateAndSelect(files[0]);
    }
  };

  const onFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleValidateAndSelect(files[0]);
    }
  };

  const onRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onChange(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
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
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onFileInputChange}
            disabled={disabled}
            className="hidden"
          />

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
              alt="Uploaded preview"
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

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onFileInputChange}
            disabled={disabled}
            className="hidden"
          />
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
