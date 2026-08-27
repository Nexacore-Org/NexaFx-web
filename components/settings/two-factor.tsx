"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Shield, ShieldOff, Key, Download } from "lucide-react";

const MOCK_SECRET = "JBSWY3DPEHPK3PXP";
const MOCK_QR_URL = `otpauth://totp/NexaFx:user@example.com?secret=${MOCK_SECRET}&issuer=NexaFx`;
const MOCK_BACKUP_CODES = [
  "ABCD-EFGH-IJKL",
  "MNOP-QRST-UVWX",
  "YZ12-3456-7890",
  "ABCD-1234-EFGH",
  "5678-IJKL-9012",
  "MNOP-3456-QRST",
];

export function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const handleEnable = () => {
    setShowSetup(true);
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setVerified(true);
      setIsEnabled(true);
      setBackupCodes(MOCK_BACKUP_CODES);
    }
  };

  const handleDisable = () => {
    setIsEnabled(false);
    setShowSetup(false);
    setVerified(false);
    setVerificationCode("");
    setBackupCodes(null);
    setShowDisableConfirm(false);
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_SECRET);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadCodes = () => {
    const blob = new Blob([MOCK_BACKUP_CODES.join("\n")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexafx-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border-[#8C8C8C] border-[0.25px] bg-card">
      <h3 className="text-muted-foreground mb-4.5 font-semibold text-base mx-5 pt-6.25 pb-4.5 dark:text-white dark:border-slate-300 border-[#00000026] border-b">
        Two-Factor Authentication
      </h3>

      <div className="space-y-6 pb-5 px-5">
        <div className="flex max-sm:flex-col max-sm:items-start justify-between items-center gap-6">
          <div className="max-w-124.25">
            <div className="flex items-center gap-2 mb-1">
              {isEnabled ? (
                <Shield className="size-5 text-green-500" />
              ) : (
                <ShieldOff className="size-5 text-muted-foreground" />
              )}
              <h4 className="text-foreground font-semibold text-[15px] sm:text-lg">
                {isEnabled ? "2FA Enabled" : "2FA Not Configured"}
              </h4>
            </div>
            <p className="text-[12px] text-muted-foreground font-normal">
              {isEnabled
                ? "Your account is protected with two-factor authentication."
                : "Add an extra layer of security to your account."}
            </p>
          </div>
          {isEnabled ? (
            <button
              onClick={() => setShowDisableConfirm(true)}
              className="flex shrink-0 text-sm w-23.5 justify-center items-center gap-1.5 cursor-pointer border h-8 border-border hover:bg-muted text-foreground font-semibold transition-colors"
            >
              <ShieldOff className="size-4" /> Disable
            </button>
          ) : (
            <button
              onClick={handleEnable}
              className="button-verify shrink-0 rounded-[19px] w-21.5 h-7 cursor-pointer text-[14px] font-semibold"
            >
              <span className="bg-background text-foreground rounded-[19px]">
                Enable 2FA
              </span>
            </button>
          )}
        </div>

        {showSetup && !verified && (
          <div className="border border-border rounded-xl p-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={MOCK_QR_URL} size={180} />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Or enter this secret key manually:
              </p>
              <div className="flex items-center gap-2 bg-muted rounded-md px-4 py-2.5">
                <Key className="size-4 text-muted-foreground shrink-0" />
                <code className="text-sm font-mono text-foreground flex-1">
                  {MOCK_SECRET}
                </code>
                <button
                  onClick={handleCopySecret}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy secret key"
                >
                  {copiedSecret ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Verification Code
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                className="w-full px-4 py-2.5 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#F39A00] transition-all text-sm text-foreground text-center tracking-[0.5em] font-mono"
              />
              <button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6}
                className="w-full cursor-pointer py-3 bg-[#F0BB16] hover:bg-yellow-500 rounded-sm text-black font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify & Enable
              </button>
            </div>
          </div>
        )}

        {verified && backupCodes && (
          <div className="border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-foreground font-semibold text-sm">
                Backup Recovery Codes
              </h4>
              <button
                onClick={handleDownloadCodes}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="size-4" /> Download
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Save these backup codes in a secure place. You can use them to
              access your account if you lose your authenticator device.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <div
                  key={i}
                  className="bg-muted rounded-md px-3 py-2 font-mono text-xs text-foreground text-center"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDisableConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowDisableConfirm(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-base font-semibold text-center text-foreground">
                Disable Two-Factor Authentication
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Are you sure you want to disable 2FA? Your account will be less
                secure.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisableConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable}
                  className="flex-1 py-2.5 rounded-lg bg-[#E90004] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Disable
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
