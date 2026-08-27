"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download, Loader2, AlertTriangle } from "lucide-react"
import { setup2FA, verify2FA } from "@/lib/api/auth"

interface TwoFactorSetupModalProps {
  onClose: () => void
  onEnabled: () => void
}

export function TwoFactorSetupModal({ onClose, onEnabled }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState(0)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    setup2FA()
      .then((data) => {
        setQrCodeUrl(data.qrCodeUrl)
        setSecret(data.secret)
        setBackupCodes(data.backupCodes)
        setStep(1)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to setup 2FA"))
      .finally(() => setLoading(false))
  }, [])

  const handleVerify = async () => {
    if (code.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      const data = await verify2FA(code)
      setBackupCodes(data.backupCodes)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "nexafx-backup-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-card rounded-xl shadow-xl p-6 w-full max-w-md space-y-6">
          {loading && step === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Setting up two-factor authentication...</p>
            </div>
          ) : error && step === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={onClose} className="text-sm underline text-muted-foreground">Close</button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Scan QR Code</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy).
                  </p>
                  <div className="flex justify-center">
                    <div className="rounded-xl border bg-white p-4">
                      <QRCodeSVG value={qrCodeUrl} size={180} />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-muted-foreground">Or enter this key manually:</p>
                    <code className="rounded bg-muted px-3 py-1 text-sm font-mono select-all">{secret}</code>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-xs text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Make sure you save your secret key. You will need it if you lose access to your authenticator app.</span>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  >
                    I have scanned the QR code
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center">Verify Code</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Enter the 6-digit code from your authenticator app.
                  </p>
                  {error && <p className="text-xs text-destructive text-center">{error}</p>}
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full text-center text-2xl tracking-[0.5em] rounded-lg border bg-background px-4 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={code.length !== 6 || loading}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify
                  </button>
                  <button onClick={() => setStep(1)} className="w-full text-sm text-muted-foreground underline hover:text-foreground">
                    Back
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-center text-green-600">Two-Factor Authentication Enabled</h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2 text-xs text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Save these backup codes in a secure place. You can use each code once to access your account if you lose your authenticator device.</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-4">
                    {backupCodes.map((bc, i) => (
                      <code key={i} className="text-xs font-mono">{bc}</code>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={copyBackupCodes} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted">
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={downloadBackupCodes} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                  <button
                    onClick={() => { onEnabled(); onClose() }}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  >
                    Done
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
