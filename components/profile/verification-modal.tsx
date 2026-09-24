'use client';

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, FileText, Car, Upload, X, ArrowLeft, Check, AlertCircle, Image } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocumentType = 'national-id' | 'passport' | 'drivers-license';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Invalid file type. Accepted: JPG, PNG, PDF.';
  }
  if (file.size > MAX_SIZE) {
    return 'File too large. Maximum size is 5MB.';
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DOCUMENT_OPTIONS: { type: DocumentType; label: string; icon: typeof CreditCard; needsBack: boolean }[] = [
  { type: 'national-id', label: 'National ID', icon: CreditCard, needsBack: true },
  { type: 'passport', label: 'Passport', icon: FileText, needsBack: false },
  { type: 'drivers-license', label: "Driver's License", icon: Car, needsBack: true },
];

export function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const needsBack = documentType === 'national-id' || documentType === 'drivers-license';
  const selectedOption = DOCUMENT_OPTIONS.find((o) => o.type === documentType);

  const reset = useCallback(() => {
    setStep(1);
    setDocumentType(null);
    setFrontFile(null);
    setBackFile(null);
    setSelfieFile(null);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (file: File | null, key: 'front' | 'back' | 'selfie') => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [key]: error }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (key === 'front') setFrontFile(file);
    else if (key === 'back') setBackFile(file);
    else setSelfieFile(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: Replace with real API call
    // const formData = new FormData();
    // formData.append('documentType', documentType!);
    // formData.append('front', frontFile!);
    // if (backFile) formData.append('back', backFile);
    // formData.append('selfie', selfieFile!);
    // await fetch('/api/verification/submit', { method: 'POST', body: formData });

    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    handleClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white dark:bg-card w-full max-w-3xl rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative'>
        {/* Header */}
        <div className='p-6 md:p-8 pb-4'>
          <div className='flex justify-between items-start mb-2'>
            <h2 className='text-xl font-bold tracking-tight'>ACCOUNT VERIFICATION</h2>
            <button onClick={handleClose} className='text-muted-foreground hover:text-foreground transition-colors p-1 -m-1'>
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Step indicator */}
          <div className='flex items-center gap-2 mt-4 mb-6'>
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className='flex items-center gap-2'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    s === step
                      ? 'bg-primary text-black'
                      : s < step
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <Check className='w-4 h-4' /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-8 h-0.5 ${s < step ? 'bg-primary/40' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Document Type Selection */}
          {step === 1 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Select Document Type</h3>
              <p className='text-sm text-muted-foreground'>Choose the type of government-issued ID you'd like to verify with.</p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4'>
                {DOCUMENT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => {
                        setDocumentType(opt.type);
                        setStep(2);
                      }}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group`}
                    >
                      <div className='w-14 h-14 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors'>
                        <Icon className='w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors' />
                      </div>
                      <span className='text-sm font-semibold'>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {step === 2 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Upload Document</h3>
              <p className='text-sm text-muted-foreground'>
                Upload the front of your <span className='font-medium text-foreground'>{selectedOption?.label}</span>.
                {needsBack && ' You will also need to upload the back.'}
              </p>

              {/* Front upload */}
              <UploadArea
                label='Front of Document'
                file={frontFile}
                inputRef={frontInputRef}
                onChange={(f) => handleFileChange(f, 'front')}
                onClear={() => { setFrontFile(null); setErrors((p) => { const n = { ...p }; delete n.front; return n; }); }}
                error={errors.front}
              />

              {/* Back upload - conditional */}
              {needsBack && (
                <UploadArea
                  label='Back of Document'
                  file={backFile}
                  inputRef={backInputRef}
                  onChange={(f) => handleFileChange(f, 'back')}
                  onClear={() => { setBackFile(null); setErrors((p) => { const n = { ...p }; delete n.back; return n; }); }}
                  error={errors.back}
                />
              )}
            </div>
          )}

          {/* Step 3: Selfie Upload */}
          {step === 3 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Upload Selfie</h3>
              <p className='text-sm text-muted-foreground'>
                Take a clear photo of your face. This will be compared with your document photo.
              </p>

              <UploadArea
                label='Selfie / Photo'
                file={selfieFile}
                inputRef={selfieInputRef}
                onChange={(f) => handleFileChange(f, 'selfie')}
                onClear={() => { setSelfieFile(null); setErrors((p) => { const n = { ...p }; delete n.selfie; return n; }); }}
                error={errors.selfie}
                showPreview
              />
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Review & Submit</h3>
              <p className='text-sm text-muted-foreground'>Please review your information before submitting.</p>

              <div className='rounded-xl border border-border bg-muted/20 p-4 space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Document Type</span>
                  <span className='font-medium'>{selectedOption?.label}</span>
                </div>
                <div className='h-px bg-border' />
                <FileSummary label='Front of Document' file={frontFile} />
                {needsBack && <FileSummary label='Back of Document' file={backFile} />}
                <FileSummary label='Selfie' file={selfieFile} />
              </div>

              <div className='flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4'>
                <AlertCircle className='w-5 h-5 text-primary mt-0.5 shrink-0' />
                <p className='text-sm text-muted-foreground'>
                  Document verification is currently in preview mode. Your submission will be reviewed once the verification system is fully launched.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 md:p-8 pt-0 flex flex-col-reverse sm:flex-row gap-4 justify-between mt-4'>
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className='inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-bold text-foreground hover:bg-muted/50 transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                Back
              </button>
            )}
          </div>
          <div className='flex gap-3'>
            <button
              onClick={handleClose}
              className='inline-flex items-center justify-center rounded-lg border border-border bg-white px-6 py-3 text-sm font-bold text-foreground hover:bg-muted/50 transition-colors'
            >
              Cancel
            </button>
            {step < 4 ? (
              <button
                onClick={() => {
                  if (step === 2 && !frontFile) {
                    setErrors({ front: 'Front of document is required.' });
                    return;
                  }
                  if (step === 2 && needsBack && !backFile) {
                    setErrors({ back: 'Back of document is required.' });
                    return;
                  }
                  if (step === 3 && !selfieFile) {
                    setErrors({ selfie: 'Selfie is required.' });
                    return;
                  }
                  setStep((s) => s + 1);
                }}
                className='inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-bold text-black hover:bg-primary/90 transition-transform active:scale-95'
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className='inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-bold text-black hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none'
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function UploadArea({
  label,
  file,
  inputRef,
  onChange,
  onClear,
  error,
  showPreview = false,
}: {
  label: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (file: File) => void;
  onClear: () => void;
  error?: string;
  showPreview?: boolean;
}) {
  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-muted-foreground'>{label}</label>
      <input
        type='file'
        ref={inputRef}
        className='hidden'
        accept='.jpg,.jpeg,.png,.pdf'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = '';
        }}
      />
      {file ? (
        <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4'>
          {showPreview && file.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(file)}
              alt='Preview'
              className='w-16 h-16 rounded-lg object-cover'
            />
          )}
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>{file.name}</p>
            <p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
          </div>
          <button
            onClick={onClear}
            className='p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className='w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/10 hover:bg-muted/30 p-8 flex flex-col items-center gap-2 transition-colors'
        >
          <Upload className='w-8 h-8 text-muted-foreground' />
          <span className='text-sm font-medium text-muted-foreground'>Click to upload</span>
          <span className='text-xs text-muted-foreground/70'>JPG, PNG, or PDF — max 5MB</span>
        </button>
      )}
      {error && (
        <p className='text-sm text-red-500 flex items-center gap-1.5'>
          <AlertCircle className='w-3.5 h-3.5' />
          {error}
        </p>
      )}
    </div>
  );
}

function FileSummary({ label, file }: { label: string; file: File | null }) {
  return (
    <div className='flex items-center justify-between text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      {file ? (
        <span className='font-medium truncate max-w-[200px]' title={file.name}>{file.name}</span>
      ) : (
        <span className='text-muted-foreground/50 italic'>Not uploaded</span>
      )}
    </div>
  );
}
