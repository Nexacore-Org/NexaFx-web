"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { usePinLock } from "@/hooks/use-pin-lock";

const AUTO_LOCK_OPTIONS = [
  { label: "1 min", value: 60 * 1000 },
  { label: "5 min", value: 5 * 60 * 1000 },
  { label: "15 min", value: 15 * 60 * 1000 },
  { label: "30 min", value: 30 * 60 * 1000 },
  { label: "Never", value: 0 },
];

export function Security() {
  const { hasPin, setupPin, changePin, disablePin, autoLockMs, setAutoLockMs, lockNow } = usePinLock();
  const [currentPin, setCurrentPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const resetFields = () => {
    setCurrentPin("");
    setPin("");
    setConfirmPin("");
  };

  const validateNewPin = () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4 to 6 digits.");
      return false;
    }
    if (pin !== confirmPin) {
      setError("PIN confirmation does not match.");
      return false;
    }
    return true;
  };

  const handleSavePin = async () => {
    setError("");
    setMessage("");
    if (!validateNewPin()) return;

    setSaving(true);
    const saved = hasPin ? await changePin(currentPin, pin) : await setupPin(pin);
    setSaving(false);

    if (!saved) {
      setError(hasPin ? "Current PIN is incorrect." : "Unable to save PIN.");
      return;
    }

    resetFields();
    setMessage(hasPin ? "PIN changed." : "PIN enabled.");
  };

  const handleDisablePin = async () => {
    setError("");
    setMessage("");
    setSaving(true);
    const disabled = await disablePin(currentPin);
    setSaving(false);

    if (!disabled) {
      setError("Current PIN is incorrect.");
      return;
    }

    resetFields();
    setMessage("PIN disabled.");
  };

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account security settings.
        </p>
      </div>

      <div className="px-5 py-6 space-y-6">
        <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6">
          <div className="max-w-lg">
            <h3 className="text-foreground font-semibold text-[15px] sm:text-lg">
              Change Password
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Update your password to keep your account secure.
            </p>
          </div>
          <p
            className="text-sm text-muted-foreground italic shrink-0"
            role="status"
          >
            Password changes are not yet supported
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex max-sm:flex-col max-sm:items-start justify-between gap-6">
            <div className="max-w-lg">
              <h3 className="text-foreground font-semibold text-[15px] sm:text-lg flex items-center gap-2">
                <LockKeyhole className="size-4" />
                App PIN
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Lock the app after inactivity and unlock locally with a hashed 4-6 digit PIN.
              </p>
            </div>
            {hasPin && (
              <button
                type="button"
                onClick={lockNow}
                className="h-9 rounded-xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Lock Now
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {hasPin && (
              <div className="space-y-2">
                <label htmlFor="current-pin" className="text-sm font-medium text-foreground">
                  Current PIN
                </label>
                <input
                  id="current-pin"
                  value={currentPin}
                  onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  type="password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="new-pin" className="text-sm font-medium text-foreground">
                {hasPin ? "New PIN" : "Set PIN"}
              </label>
              <input
                id="new-pin"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                type="password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-pin" className="text-sm font-medium text-foreground">
                Confirm PIN
              </label>
              <input
                id="confirm-pin"
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                type="password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <label htmlFor="pin-timeout" className="text-sm font-medium text-foreground">
                Auto-lock after
              </label>
              <select
                id="pin-timeout"
                value={autoLockMs}
                onChange={(event) => setAutoLockMs(Number(event.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm sm:w-40"
              >
                {AUTO_LOCK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              {hasPin && (
                <button
                  type="button"
                  onClick={handleDisablePin}
                  disabled={saving || !currentPin}
                  className="rounded-xl border border-destructive px-4 py-2 text-sm font-semibold text-destructive disabled:opacity-50"
                >
                  Disable PIN
                </button>
              )}
              <button
                type="button"
                onClick={handleSavePin}
                disabled={saving || (hasPin && !currentPin)}
                className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
              >
                {hasPin ? "Change PIN" : "Set up PIN"}
              </button>
            </div>
          </div>

          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
