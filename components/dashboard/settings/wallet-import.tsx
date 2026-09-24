"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { importWallet } from "@/lib/api/wallet";
import {
  derivePublicKeyFromSecret,
  encryptWalletSecret,
  isValidStellarSecretKey,
} from "@/lib/utils/stellar-wallet";

type ImportMethod = "secret" | "seed";

type Props = {
  onClose: () => void;
};

export function WalletImport({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [understood, setUnderstood] = useState(false);
  const [method, setMethod] = useState<ImportMethod>("secret");
  const [secretKey, setSecretKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [deriveError, setDeriveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function derive() {
      setPublicKey("");
      setDeriveError(null);

      if (method === "seed") {
        if (seedPhrase.trim()) {
          setDeriveError("Seed phrase derivation requires a confirmed Stellar mnemonic path. Use a Stellar secret key for this import.");
        }
        return;
      }

      const trimmed = secretKey.trim();
      if (!trimmed) return;
      if (!isValidStellarSecretKey(trimmed)) {
        setDeriveError("Enter a valid Stellar secret key that starts with S and has 56 characters.");
        return;
      }

      try {
        const derived = await derivePublicKeyFromSecret(trimmed);
        if (!cancelled) setPublicKey(derived);
      } catch (error) {
        if (!cancelled) {
          setDeriveError(error instanceof Error ? error.message : "Could not derive the public key.");
        }
      }
    }

    derive();

    return () => {
      cancelled = true;
    };
  }, [method, secretKey, seedPhrase]);

  const secretForImport = method === "secret" ? secretKey.trim() : "";
  const canSubmit = Boolean(publicKey && password && secretForImport && !submitting);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Security approach: derive the public key locally and send only the AES-256-GCM encrypted secret key to the import endpoint.
      const encryptedSecretKey = await encryptWalletSecret(secretForImport, password);
      await importWallet({ encryptedSecretKey, publicKey });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to import wallet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={step === 1 ? "font-semibold text-foreground" : ""}>Warning</span>
        <span>/</span>
        <span className={step === 2 ? "font-semibold text-foreground" : ""}>Method</span>
        <span>/</span>
        <span className={step === 3 ? "font-semibold text-foreground" : ""}>Password</span>
        <span>/</span>
        <span className={step === 4 ? "font-semibold text-foreground" : ""}>Confirm</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <p className="text-sm text-foreground">
                This action replaces your current wallet address. Any funds sent to your old address after this change will not be credited automatically. Are you sure you want to continue?
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={understood}
              onChange={(event) => setUnderstood(event.target.checked)}
              className="size-4 rounded border-input"
            />
            I understand
          </label>
          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!understood}
            className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMethod("secret")}
              className={`rounded-lg border px-4 py-3 text-left text-sm ${method === "secret" ? "border-foreground bg-muted" : "border-border"}`}
            >
              Stellar secret key
            </button>
            <button
              type="button"
              onClick={() => setMethod("seed")}
              className={`rounded-lg border px-4 py-3 text-left text-sm ${method === "seed" ? "border-foreground bg-muted" : "border-border"}`}
            >
              Recovery seed phrase
            </button>
          </div>

          {method === "secret" ? (
            <div className="space-y-2">
              <label htmlFor="stellar-secret-key" className="text-sm font-medium text-foreground">
                Stellar secret key
              </label>
              <input
                id="stellar-secret-key"
                type="password"
                value={secretKey}
                onChange={(event) => setSecretKey(event.target.value)}
                placeholder="S..."
                autoComplete="off"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="stellar-seed-phrase" className="text-sm font-medium text-foreground">
                12 or 24-word seed phrase
              </label>
              <textarea
                id="stellar-seed-phrase"
                value={seedPhrase}
                onChange={(event) => setSeedPhrase(event.target.value)}
                rows={4}
                autoComplete="off"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {deriveError && <p className="text-xs text-destructive">{deriveError}</p>}
          {publicKey && <p className="text-xs text-green-600">Public key derived successfully.</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!publicKey}
              className="flex-1 rounded-lg bg-foreground py-2.5 text-sm font-semibold text-background disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="wallet-import-password" className="text-sm font-medium text-foreground">
              Account password
            </label>
            <input
              id="wallet-import-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              The password is used only in this browser to encrypt the secret key before submission.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              disabled={!password}
              className="flex-1 rounded-lg bg-foreground py-2.5 text-sm font-semibold text-background disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">This public key will become your new NexaFx wallet address:</p>
                <p className="mt-2 break-all rounded bg-muted px-3 py-2 text-sm font-mono text-foreground">{publicKey}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Importing a new wallet will replace your current NexaFx wallet. All future deposits must be sent to the new address.
          </p>
          {submitError && <p className="text-xs text-destructive">{submitError}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={submitting}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium disabled:opacity-50"
            >
              <ArrowLeft className="mr-1 inline size-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? <Loader2 className="mr-1 inline size-4 animate-spin" /> : <CheckCircle2 className="mr-1 inline size-4" />}
              Confirm import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
