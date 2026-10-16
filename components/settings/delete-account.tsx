"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AccountDeletionBlockedError, deleteAccount } from "../../lib/api/user";
import { FormError } from "./settings-section";
import ConfirmDialog from "../ui/confirm-dialog";

const CONFIRMATION_PHRASE = "DELETE";

/**
 * Self-service account deletion.
 *
 * Two independent gates must both be satisfied before the destructive request
 * is sent: the user must type the confirmation phrase exactly, and must
 * supply their password. Neither value is stored, placed in a URL or logged,
 * and both are cleared once the dialog closes.
 */
export default function DeleteAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [blockers, setBlockers] = useState<{ message: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setConfirmation("");
    setPassword("");
    setBlockers([]);
    setError(null);
  };

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      // Drop every cached response before leaving, so a later sign-in on this
      // device cannot render the deleted account's data.
      queryClient.clear();
      close();
      router.replace("/account-deleted");
    },
    onError: (err: Error) => {
      if (err instanceof AccountDeletionBlockedError) {
        setBlockers(err.blockers);
        setError(
          err.blockers.length > 0
            ? "Your account cannot be deleted until you resolve the following."
            : "Your account cannot be deleted yet. Please contact support.",
        );
        return;
      }
      setError(err.message || "We could not delete your account. Try again.");
    },
  });

  const phraseMatches = confirmation === CONFIRMATION_PHRASE;
  const canDelete = phraseMatches && password.length > 0 && !mutation.isPending;

  return (
    <div>
      <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
        Deleting your account permanently removes your profile, transaction
        history and saved payment details. Balances must be withdrawn first, and
        we cannot delete an account with a non-zero balance or transactions
        still in flight.
      </p>

      <p className="mt-2 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
        Where financial regulations require it, we retain anonymised transaction
        records after deletion. Your identity is not included in those records.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Delete account
      </button>

      <ConfirmDialog
        open={open}
        title="Delete your account"
        tone="danger"
        confirmLabel="Permanently delete my account"
        busy={mutation.isPending}
        confirmDisabled={!canDelete}
        onCancel={close}
        onConfirm={() =>
          mutation.mutate({ confirmation: CONFIRMATION_PHRASE, password })
        }
        description="This cannot be undone. Confirm the details below to continue."
      >
        <div className="space-y-4">
          {blockers.length > 0 && (
            <div
              role="alert"
              className="rounded border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/40"
            >
              <p className="font-medium">Before you can delete your account:</p>
              <ul className="mt-1 list-disc pl-5">
                {blockers.map((blocker, i) => (
                  <li key={i}>{blocker.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="delete-confirmation"
            >
              Type <code className="font-mono">{CONFIRMATION_PHRASE}</code> to
              confirm
            </label>
            <input
              id="delete-confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              disabled={mutation.isPending}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="delete-confirmation-hint"
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p
              id="delete-confirmation-hint"
              className="mt-1 text-xs text-zinc-500"
            >
              {phraseMatches
                ? "Confirmed."
                : "The confirmation phrase must match exactly."}
            </p>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="delete-password"
            >
              Your password
            </label>
            <input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={mutation.isPending}
              autoComplete="current-password"
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          {error && <FormError message={error} />}
        </div>
      </ConfirmDialog>
    </div>
  );
}
