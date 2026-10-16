"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../lib/notify";
import {
  TWO_FACTOR_SUPPORTED,
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  fetchTwoFactorStatus,
  TwoFactorInvalidCodeError,
} from "../../lib/api/two-factor";
import { OTPInput } from "../auth/otp-input";
import StepModal from "../ui/step-modal";
import ConfirmDialog from "../ui/confirm-dialog";
import { FormError } from "./settings-section";

const QR_MODULES = {
  qrcode: () => import("qrcode").then((m) => m.default),
};

function formatSecret(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Two-factor authentication setup and removal.
 *
 * Sensitive values (the TOTP secret, the current 6-digit code, the backup
 * codes) live only in component state. They are cleared when the dialog
 * closes and are never written to storage. Backup codes are shown exactly
 * once: closing the dialog discards them and the only way to see them again
 * is to regenerate a fresh set.
 */
export default function TwoFactorSettings() {
  const queryClient = useQueryClient();

  const [setupOpen, setSetupOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [codesSaved, setCodesSaved] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");

  const status = useQuery({
    queryKey: ["two-factor", "status"],
    queryFn: fetchTwoFactorStatus,
    enabled: TWO_FACTOR_SUPPORTED,
  });

  const beginSetup = useMutation({
    mutationFn: beginTwoFactorSetup,
    onSuccess: (data) => {
      setSecret(data.secret);
      setOtpauthUri(data.otpauthUri);
      setSetupOpen(true);
    },
    onError: () => notify.error("Could not start two-factor setup."),
  });

  const confirmSetup = useMutation({
    mutationFn: confirmTwoFactorSetup,
    onSuccess: (data) => {
      setBackupCodes(data.codes);
      void queryClient.invalidateQueries({
        queryKey: ["two-factor", "status"],
      });
    },
    onError: (err: Error) => {
      setSetupError(
        err instanceof TwoFactorInvalidCodeError
          ? "That code is not valid. Check your authenticator app and try again."
          : "We could not confirm your code. Try again.",
      );
    },
  });

  const removeTwoFactor = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["two-factor", "status"],
      });
      closeDisable();
      notify.success("Two-factor authentication turned off.");
    },
    onError: (err: Error) => {
      notify.error(
        err instanceof TwoFactorInvalidCodeError
          ? "That code is not valid."
          : "We could not turn off two-factor authentication.",
      );
    },
  });

  // Drop every secret when the dialog closes.
  const closeDisable = () => {
    setDisableOpen(false);
    setDisableCode("");
    setDisablePassword("");
  };

  const closeSetup = () => {
    setSetupOpen(false);
    setSecret(null);
    setOtpauthUri(null);
    setBackupCodes(null);
    setCodesSaved(false);
    setSetupError(null);
    confirmSetup.reset();
  };

  if (!TWO_FACTOR_SUPPORTED) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Two-factor authentication is not available on this deployment.
      </p>
    );
  }

  const enabled = status.data?.enabled === true;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">
            {enabled ? "Two-factor authentication is on" : "Off"}
          </p>
          <p className="mt-1 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
            {enabled
              ? "You will be asked for a code from your authenticator app when signing in."
              : "Add a second step to sign-in using an authenticator app."}
          </p>
        </div>

        {enabled ? (
          <button
            type="button"
            onClick={() => setDisableOpen(true)}
            className="shrink-0 rounded border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            Turn off
          </button>
        ) : (
          <button
            type="button"
            onClick={() => beginSetup.mutate()}
            disabled={beginSetup.isPending}
            className="shrink-0 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {beginSetup.isPending ? "Starting…" : "Set up"}
          </button>
        )}
      </div>

      <StepModal
        open={setupOpen}
        title="Set up two-factor authentication"
        busy={confirmSetup.isPending}
        onClose={closeSetup}
        finishLabel="I've saved my backup codes"
        onFinish={
          backupCodes
            ? () => (codesSaved ? closeSetup() : undefined)
            : undefined
        }
        steps={[
          {
            id: "scan",
            title: "Scan",
            content: <ScanStep otpauthUri={otpauthUri} secret={secret} />,
          },
          {
            id: "verify",
            title: "Verify",
            content: (
              <div>
                <p className="text-sm">
                  Enter the 6-digit code from your authenticator app.
                </p>
                {setupError && (
                  <div className="mt-3">
                    <FormError message={setupError} />
                  </div>
                )}
                <div className="mt-3">
                  <OTPInput
                    maxDigits={6}
                    onSubmit={(code) => {
                      setSetupError(null);
                      confirmSetup.mutate(code);
                    }}
                  />
                </div>
              </div>
            ),
          },
          {
            id: "codes",
            title: "Backup codes",
            content: backupCodes ? (
              <BackupCodesStep
                codes={backupCodes}
                saved={codesSaved}
                onChange={setCodesSaved}
              />
            ) : null,
          },
        ]}
      />

      <ConfirmDialog
        open={disableOpen}
        title="Turn off two-factor authentication"
        tone="danger"
        confirmLabel="Turn off"
        busy={removeTwoFactor.isPending}
        onCancel={closeDisable}
        onConfirm={() =>
          removeTwoFactor.mutate({
            code: disableCode || undefined,
            password: disablePassword || undefined,
          })
        }
        description="Enter a current code from your authenticator app, or your account password, to confirm."
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm" htmlFor="disable-code">
              Authenticator code (optional)
            </label>
            <input
              id="disable-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={disableCode}
              onChange={(e) =>
                setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={removeTwoFactor.isPending}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm" htmlFor="disable-password">
              Account password (optional)
            </label>
            <input
              id="disable-password"
              type="password"
              autoComplete="current-password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              disabled={removeTwoFactor.isPending}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}

/**
 * QR rendering. `qrcode` is loaded on demand so the canvas dependency is
 * only downloaded when a user actually starts 2FA setup. If the module
 * cannot load, the manual secret below remains the way forward.
 */
function ScanStep({
  otpauthUri,
  secret,
}: {
  otpauthUri: string | null;
  secret: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!otpauthUri || !canvasRef.current) return;
    let cancelled = false;

    QR_MODULES.qrcode()
      .then((QRCode) => {
        if (cancelled || !canvasRef.current) return;
        QRCode.toCanvas(canvasRef.current, otpauthUri, {
          width: 192,
          margin: 1,
          color: { dark: "#000000ff", light: "#ffffffff" },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [otpauthUri]);

  return (
    <div>
      <p className="text-sm">
        Scan this code with your authenticator app, or enter the secret by hand.
      </p>

      <div className="mt-4 flex justify-center">
        {failed ? (
          <p className="max-w-xs text-center text-sm text-amber-700">
            The QR image could not be loaded. Enter the secret manually below.
          </p>
        ) : (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Authenticator setup QR code"
            className="rounded bg-white p-2"
          />
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Setup key
        </p>
        <p className="mt-1 rounded bg-zinc-100 px-3 py-2 font-mono text-sm break-all dark:bg-zinc-800">
          {secret ? formatSecret(secret) : "—"}
        </p>
      </div>
    </div>
  );
}

function BackupCodesStep({
  codes,
  saved,
  onChange,
}: {
  codes: string[];
  saved: boolean;
  onChange: (value: boolean) => void;
}) {
  const download = () => {
    const blob = new Blob(
      ["NexaFx two-factor backup codes\n\n" + codes.join("\n") + "\n"],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nexafx-backup-codes.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <p className="text-sm">
        Save these codes somewhere safe. Each one can be used once if you lose
        access to your authenticator app.{" "}
        <strong className="font-semibold">
          They are shown only once and cannot be viewed again.
        </strong>
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-2 rounded bg-zinc-100 p-3 font-mono text-sm dark:bg-zinc-800">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(codes.join("\n"));
              notify.success("Backup codes copied.");
            } catch {
              notify.error("Could not copy to the clipboard.");
            }
          }}
          className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
        >
          Download .txt
        </button>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={saved}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5"
        />
        I have saved these backup codes somewhere safe.
      </label>
    </div>
  );
}
