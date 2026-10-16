"use client";

import { useState, useRef } from "react";
import StepModal, { StepModalStep } from "@/components/ui/step-modal";
import { FileDropzone } from "@/components/kyc/file-dropzone";
import { BvnStep } from "@/components/kyc/bvn-step";
import { NinStep } from "@/components/kyc/nin-step";
import { uploadKycDocument, submitKycDocuments } from "@/lib/api/kyc";

export interface KycWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  defaultMethod?: "bvn" | "nin" | "document" | null;
}

type Method = "bvn" | "nin" | "document";

export function KycWizard({
  open,
  onClose,
  onComplete,
  defaultMethod = "bvn",
}: KycWizardProps) {
  const [selectedMethod, setSelectedMethod] = useState<Method>(
    defaultMethod ?? "bvn",
  );
  const [stepIndex, setStepIndex] = useState(0);

  // Document files held in component memory ONLY — never written to storage
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resetState = () => {
    setIdFile(null);
    setSelfieFile(null);
    setAddressFile(null);
    setConsentGiven(false);
    setUploadProgress(null);
    setIsUploading(false);
    setUploadError(null);
    setStepIndex(0);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleDocumentSubmit = async () => {
    if (!idFile || !selfieFile || !addressFile || !consentGiven || isUploading)
      return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Upload ID file
      setUploadProgress(20);
      const idRes = await uploadKycDocument({
        kind: "identity",
        file: idFile,
        signal: controller.signal,
      });

      // 2. Upload Selfie file
      setUploadProgress(50);
      const selfieRes = await uploadKycDocument({
        kind: "selfie",
        file: selfieFile,
        signal: controller.signal,
      });

      // 3. Upload Proof of Address file
      setUploadProgress(80);
      const addressRes = await uploadKycDocument({
        kind: "proof_of_address",
        file: addressFile,
        signal: controller.signal,
      });

      // 4. Submit all documents for review
      setUploadProgress(95);
      await submitKycDocuments({
        documentIds: [idRes.id, selfieRes.id, addressRes.id].filter(Boolean),
      });

      setUploadProgress(100);
      resetState();
      onComplete();
    } catch (err) {
      if (controller.signal.aborted) {
        setUploadError("Upload was cancelled.");
      } else {
        setUploadError(
          err instanceof Error
            ? err.message
            : "An error occurred while uploading your documents. Please try again.",
        );
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Steps definition based on selected method
  let steps: StepModalStep[] = [];

  if (selectedMethod === "bvn") {
    steps = [
      {
        id: "method",
        title: "Choose Method",
        content: (
          <MethodSelector
            selected={selectedMethod}
            onSelect={(m) => {
              setSelectedMethod(m);
              setStepIndex(0);
            }}
          />
        ),
      },
      {
        id: "bvn",
        title: "BVN Verification",
        content: (
          <BvnStep
            onSuccess={() => {
              resetState();
              onComplete();
            }}
            onFallbackToDocuments={() => {
              setSelectedMethod("document");
              setStepIndex(1);
            }}
          />
        ),
      },
    ];
  } else if (selectedMethod === "nin") {
    steps = [
      {
        id: "method",
        title: "Choose Method",
        content: (
          <MethodSelector
            selected={selectedMethod}
            onSelect={(m) => {
              setSelectedMethod(m);
              setStepIndex(0);
            }}
          />
        ),
      },
      {
        id: "nin",
        title: "NIN Verification",
        content: (
          <NinStep
            onSuccess={() => {
              resetState();
              onComplete();
            }}
            onFallbackToDocuments={() => {
              setSelectedMethod("document");
              setStepIndex(1);
            }}
          />
        ),
      },
    ];
  } else {
    // Document upload multi-step
    steps = [
      {
        id: "method",
        title: "Choose Method",
        content: (
          <MethodSelector
            selected={selectedMethod}
            onSelect={(m) => {
              setSelectedMethod(m);
              setStepIndex(0);
            }}
          />
        ),
      },
      {
        id: "id_doc",
        title: "ID Document",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Upload a clear photo or scan of your government-issued ID
              (International Passport, National ID card, or Driver’s License).
            </p>
            <FileDropzone
              label="Government ID Document"
              value={idFile}
              onChange={setIdFile}
              disabled={isUploading}
            />
          </div>
        ),
      },
      {
        id: "selfie",
        title: "Selfie",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Take a clear selfie showing your full face with good lighting. Do
              not wear glasses or hats.
            </p>
            <FileDropzone
              label="Selfie Photo"
              accept="image/jpeg,image/png"
              value={selfieFile}
              onChange={setSelfieFile}
              disabled={isUploading}
            />
          </div>
        ),
      },
      {
        id: "proof_address",
        title: "Proof of Address",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Upload a utility bill or bank statement issued within the last 3
              months showing your full name and address.
            </p>
            <FileDropzone
              label="Proof of Address Document"
              value={addressFile}
              onChange={setAddressFile}
              disabled={isUploading}
            />
          </div>
        ),
      },
      {
        id: "review",
        title: "Review & Submit",
        content: (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Review your documents
            </h3>
            <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 text-sm dark:divide-zinc-800 dark:border-zinc-800">
              <li className="flex justify-between p-3">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Government ID:
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {idFile ? idFile.name : "Not provided"}
                </span>
              </li>
              <li className="flex justify-between p-3">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Selfie:
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {selfieFile ? selfieFile.name : "Not provided"}
                </span>
              </li>
              <li className="flex justify-between p-3">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Proof of Address:
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {addressFile ? addressFile.name : "Not provided"}
                </span>
              </li>
            </ul>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                disabled={isUploading}
                className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span>
                I confirm that all documents provided are genuine, unedited, and
                belong to me. I agree to the verification terms.
              </span>
            </label>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress ?? 0}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="text-xs font-medium text-red-600 hover:text-red-500"
                >
                  Cancel upload
                </button>
              </div>
            )}

            {uploadError && (
              <p
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {uploadError}
              </p>
            )}
          </div>
        ),
      },
    ];
  }

  // Footer customization for BVN / NIN forms
  const hideFooter =
    (selectedMethod === "bvn" || selectedMethod === "nin") && stepIndex === 1;

  return (
    <StepModal
      open={open}
      title="Identity Verification (KYC)"
      steps={steps}
      currentStepIndex={stepIndex}
      onStepChange={setStepIndex}
      onClose={handleClose}
      finishLabel="Submit for Review"
      onFinish={
        selectedMethod === "document" ? handleDocumentSubmit : undefined
      }
      busy={isUploading}
      hideFooter={hideFooter}
    />
  );
}

function MethodSelector({
  selected,
  onSelect,
}: {
  selected: Method;
  onSelect: (m: Method) => void;
}) {
  const options: {
    id: Method;
    title: string;
    subtitle: string;
    tag?: string;
  }[] = [
    {
      id: "bvn",
      title: "Bank Verification Number (BVN)",
      subtitle: "Instant verification for Nigerian users via 11-digit BVN",
      tag: "Recommended",
    },
    {
      id: "nin",
      title: "National Identity Number (NIN)",
      subtitle: "Instant verification via Nigerian NIMC 11-digit NIN",
    },
    {
      id: "document",
      title: "Document Upload",
      subtitle:
        "Upload Government ID, Selfie & Proof of Address (manual review)",
    },
  ];

  return (
    <div
      className="space-y-3"
      role="radiogroup"
      aria-label="Verification Method"
    >
      {options.map((opt) => (
        <div
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(opt.id);
            }
          }}
          tabIndex={0}
          role="radio"
          aria-checked={selected === opt.id}
          className={`flex cursor-pointer items-start justify-between rounded-lg border p-4 transition ${
            selected === opt.id
              ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
              : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {opt.title}
              </span>
              {opt.tag && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {opt.tag}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {opt.subtitle}
            </p>
          </div>
          <div
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              selected === opt.id
                ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {selected === opt.id && (
              <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-zinc-900" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
