"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteProfile } from "@/lib/api/users";
import { clearAuth } from "@/lib/auth";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export function DangerZone() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (isDeleting) return;
    setShowConfirm(false);
    setConfirmText("");
    setDeleteError(null);
  };

  useFocusTrap(showConfirm, handleClose, modalRef);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProfile();
      clearAuth();
      router.push("/login");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account",
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-destructive/30 bg-card">
      <div className="px-5 pt-6 pb-4 border-b border-destructive/20">
        <h2 className="text-base font-semibold text-destructive flex items-center gap-2">
          <AlertTriangle className="size-5" aria-hidden="true" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Irreversible actions that affect your account permanently.
        </p>
      </div>

      <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6 px-5 py-6">
        <div className="max-w-lg">
          <h3 className="text-foreground font-semibold text-[15px] sm:text-lg">
            Delete Account
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex shrink-0 text-sm justify-center items-center gap-1.5 cursor-pointer bg-destructive h-9 px-4 text-white font-semibold rounded-xl hover:bg-destructive/90 transition-colors"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete Account
        </button>
      </div>

      {showConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md space-y-4 border border-border"
            >
              <h3
                id="delete-account-title"
                className="text-base font-semibold text-foreground"
              >
                Delete Account
              </h3>
              <p className="text-sm text-muted-foreground">
                This action is permanent and cannot be undone. Type{" "}
                <strong className="text-foreground">DELETE</strong> to confirm.
              </p>
              <div className="space-y-2">
                <label htmlFor="delete-confirm" className="text-sm font-medium text-foreground">
                  Confirmation
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  disabled={isDeleting}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50"
                  autoComplete="off"
                />
              </div>
              {deleteError && (
                <p className="text-xs text-destructive" role="alert">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmText !== "DELETE"}
                  className="flex-1 py-2.5 rounded-lg bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
