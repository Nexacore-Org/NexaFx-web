"use client";

/**
 * QR Scanner component for the withdrawal form.
 *
 * Uses the browser's native `BarcodeDetector` API with a canvas + interval
 * polling approach. Handles:
 * - Camera permission denied
 * - No camera available
 * - Insecure context (non-HTTPS)
 * - BarcodeDetector not available
 *
 * All media tracks are released when the dialog closes or the component
 * unmounts. No frames or scan results are sent anywhere.
 *
 * For the camera flow the PR description must include manual test notes
 * (automated camera tests are not possible in CI without device access).
 */

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Camera, X, AlertCircle, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseStellarUri } from "@/lib/stellar-uri";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QrScannerProps {
  /** Called with the scanned & validated destination address. */
  onScan: (result: { destination: string; memo?: string; amount?: string }) => void;
  /** Whether the trigger button is disabled. */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Browser capability detection
// ---------------------------------------------------------------------------

function isSecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext;
}

function hasBarcodeDetector(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

function hasMediaDevices(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices !== "undefined" &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

// ---------------------------------------------------------------------------
// Camera permissions
// ---------------------------------------------------------------------------

type CameraError =
  | "insecure-context"
  | "not-supported"
  | "permission-denied"
  | "no-camera"
  | "detector-unavailable"
  | "unknown";

function errorMessage(type: CameraError): string {
  switch (type) {
    case "insecure-context":
      return "Camera access requires a secure (HTTPS) connection.";
    case "not-supported":
      return "Your browser doesn't support camera access. Please enter the address manually.";
    case "permission-denied":
      return "Camera permission was denied. Please allow camera access in your browser settings and try again.";
    case "no-camera":
      return "No camera was found on this device. Please enter the address manually.";
    case "detector-unavailable":
      return "QR code scanning is not supported in this browser. Please enter the address manually.";
    default:
      return "Unable to access the camera. Please enter the address manually.";
  }
}

// ---------------------------------------------------------------------------
// QR scanner dialog (loaded dynamically, never on SSR)
// ---------------------------------------------------------------------------

interface ScannerDialogProps extends QrScannerProps {
  onClose: () => void;
}

function ScannerDialog({ onScan, onClose }: ScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [error, setError] = useState<CameraError | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      clearInterval(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    if (!hasBarcodeDetector()) return;

    try {
      // @ts-expect-error -- BarcodeDetector is not yet in TypeScript lib
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(canvas);
      if (codes.length > 0) {
        const raw: string = codes[0].rawValue;
        const result = parseStellarUri(raw);
        if (result.valid && result.destination) {
          setScanned(true);
          stopCamera();
          onScan({
            destination: result.destination,
            memo: result.memo,
            amount: result.amount,
          });
          setTimeout(handleClose, 600);
        } else {
          // Not a Stellar QR — keep scanning silently
        }
      }
    } catch {
      // Detector errors are non-fatal — keep scanning
    }
  }, [onScan, stopCamera, handleClose]);

  const startCamera = useCallback(async () => {
    if (!isSecureContext()) {
      setError("insecure-context");
      return;
    }
    if (!hasMediaDevices()) {
      setError("not-supported");
      return;
    }
    if (!hasBarcodeDetector()) {
      setError("detector-unavailable");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = setInterval(processFrame, 250);
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setError("permission-denied");
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setError("no-camera");
        } else {
          setError("unknown");
        }
      } else {
        setError("unknown");
      }
    }
  }, [processFrame]);

  useEffect(() => {
    void (async () => {
      await startCamera();
    })();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scan QR code"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <QrCode className="size-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Scan QR Code
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close scanner"
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Camera / Error area */}
        <div className="relative aspect-square bg-black flex items-center justify-center">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-white/80">{errorMessage(error)}</p>
            </div>
          ) : scanned ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="size-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <QrCode className="size-8 text-green-400" />
              </div>
              <p className="text-sm text-white/80">Address detected!</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                aria-label="Camera viewfinder"
              />
              {/* Aim guide overlay */}
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="size-48 border-2 border-white/60 rounded-xl" />
                </div>
              )}
            </>
          )}
          {/* Hidden canvas used for frame capture */}
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>

        {/* Footer */}
        <div className="p-4">
          {error ? (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Enter address manually
            </button>
          ) : (
            <p className="text-xs text-center text-muted-foreground">
              Point your camera at a Stellar address QR code
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Lazy-load the dialog so camera APIs are never imported on the server.
const LazyScannerDialog = dynamic(
  () => Promise.resolve(ScannerDialog),
  { ssr: false },
);

// ---------------------------------------------------------------------------
// Public trigger button + dialog
// ---------------------------------------------------------------------------

/**
 * Renders a "Scan QR" button. When clicked, opens the camera dialog.
 * On a successful scan the `onScan` callback receives the parsed data.
 */
export function QrScanner({ onScan, disabled }: QrScannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        aria-label="Scan QR code"
        className={cn(
          "flex items-center gap-1.5 px-3 py-2",
          "text-sm text-muted-foreground border border-border rounded-xl",
          "hover:border-primary/50 hover:text-foreground transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <Camera className="size-4" />
        <span>Scan QR</span>
      </button>

      {isOpen && (
        <LazyScannerDialog
          onScan={onScan}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
