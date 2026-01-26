"use client";

import { X, Calendar, Lock, Database, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStatus("idle"); // Reset status when reopening
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleVerify = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStatus("success");
  };

  if (!mounted) return null;
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card w-full max-w-3xl rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        {/* Success View */}
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="relative">
              <Image src="/Frame.svg" alt="Success" width={500} height={100} />
            </div>

            <div className="pt-4 w-full max-w-sm">
              <Link href="/" passHref legacyBehavior>
                <button className="w-full rounded-lg bg-primary px-8 py-4 text-base font-bold text-black hover:bg-primary/90 transition-transform active:scale-95">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Form View */
          <>
            <div className="p-6 md:p-8 pb-4">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold tracking-tight">
                  ACCOUNT VERIFICATION
                </h2>
              </div>

              <h3 className="text-lg font-semibold mb-6">Profile Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="Myname"
                      className="flex h-12 w-full rounded-lg border-none bg-muted/50 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="Lastname"
                      className="flex h-12 w-full rounded-lg border-none bg-muted/50 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Email <Lock className="w-3 h-3" />
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      defaultValue="Cersei414@hotmail.com"
                      readOnly
                      className="flex h-12 w-full rounded-lg border-none bg-muted/50 px-4 text-sm font-medium text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <span className="absolute right-4 top-3.5 text-muted-foreground pointer-events-none">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Select date"
                      className="flex h-12 w-full rounded-lg border-none bg-muted/50 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-24">
                      <select className="flex h-12 w-full appearance-none rounded-lg border-none bg-white border border-border px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/50 transition-all">
                        <option>+234</option>
                        <option>+1</option>
                      </select>
                      <span className="absolute right-2 top-4 pointer-events-none text-muted-foreground text-[10px]">
                        ▼
                      </span>
                    </div>
                    <input
                      type="tel"
                      defaultValue="3605226458"
                      className="flex h-12 w-full rounded-lg border-none bg-muted/50 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="houseaddress at street road"
                      className="flex h-12 w-full rounded-lg border-none bg-muted/50 px-4 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 pt-0 flex flex-col-reverse sm:flex-row gap-4 justify-end mt-4">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-8 py-3 text-sm font-bold text-foreground hover:bg-muted/50 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-10 py-3 text-sm font-bold text-black hover:bg-primary/90 transition-transform active:scale-95 w-full sm:w-auto disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? "Verifying..." : "Verify Now"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
