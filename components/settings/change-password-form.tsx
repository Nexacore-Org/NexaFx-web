"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { notify } from "../../lib/notify";
import { changePassword, WrongPasswordError } from "../../lib/api/auth";
import { isValidPassword } from "../../lib/password";
import { PasswordStrengthMeter } from "../ui/password-strength-meter";
import { FormError } from "./settings-section";

/**
 * Change-password form for Settings > Security.
 *
 * The current-password field is deliberately preserved when the server
 * rejects it, so the user can retype only that field. The new-password and
 * confirmation fields are cleared on success so the credentials never linger
 * in the DOM or in component state.
 */
export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wrongCurrent, setWrongCurrent] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const currentRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (result) => {
      setWrongCurrent(null);
      setLocalError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify.success("Password changed.");
      if (result.otherSessionsRevoked) {
        notify.info("You were signed out on all other devices.");
      }
    },
    onError: (err: Error) => {
      if (err instanceof WrongPasswordError) {
        // Specific, and scoped to one field so the other inputs survive.
        setWrongCurrent(err.message);
        setLocalError(null);
        currentRef.current?.focus();
      } else {
        setWrongCurrent(null);
        setLocalError(
          err.message || "We could not change your password. Try again.",
        );
      }
    },
  });

  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;

  const sameAsCurrent =
    newPassword.length > 0 && newPassword === currentPassword;

  const newPasswordTooWeak =
    newPassword.length > 0 && !isValidPassword(newPassword);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    !confirmMismatch &&
    !sameAsCurrent &&
    !newPasswordTooWeak &&
    !mutation.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setWrongCurrent(null);
    setLocalError(null);

    if (!canSubmit) return;

    mutation.mutate({ currentPassword, newPassword });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {localError && <FormError message={localError} />}

      <div className="space-y-4">
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="current-password"
          >
            Current password
          </label>
          <input
            ref={currentRef}
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (wrongCurrent) setWrongCurrent(null);
            }}
            disabled={mutation.isPending}
            aria-invalid={wrongCurrent ? true : undefined}
            aria-describedby={
              wrongCurrent ? "current-password-error" : undefined
            }
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {wrongCurrent && (
            <p
              id="current-password-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {wrongCurrent}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="new-password"
          >
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setLocalError(null);
            }}
            disabled={mutation.isPending}
            aria-invalid={newPasswordTooWeak ? true : undefined}
            aria-describedby="new-password-strength"
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div id="new-password-strength">
            <PasswordStrengthMeter value={newPassword} id="new-password" />
          </div>
          {sameAsCurrent && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              Your new password must be different from your current password.
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="confirm-password"
          >
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={mutation.isPending}
            aria-invalid={confirmMismatch ? true : undefined}
            aria-describedby={
              confirmMismatch ? "confirm-password-error" : undefined
            }
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {confirmMismatch && (
            <p
              id="confirm-password-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              Passwords do not match.
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {mutation.isPending ? "Changing…" : "Change password"}
      </button>

      {mutation.isSuccess && (
        <p role="status" className="mt-3 text-sm text-green-600">
          Password changed.
        </p>
      )}
    </form>
  );
}
