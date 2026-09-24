"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { registerPasskey, getPasskeys, deletePasskey, type Passkey } from "@/lib/auth/webauthn";
import { Key, Trash2, Loader2, ShieldCheck } from "lucide-react";

export function WebAuthnSection() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPasskeys = async () => {
    try {
      setLoading(true);
      const data = await getPasskeys();
      setPasskeys(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load passkeys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    try {
      await registerPasskey();
      await fetchPasskeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register passkey");
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePasskey(id);
      setPasskeys((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete passkey");
    }
  };

  const isWebAuthnSupported = typeof window !== "undefined" && window.PublicKeyCredential !== undefined;

  if (!isWebAuthnSupported) {
    return (
      <div className="text-sm text-muted-foreground">
        Passkeys are not supported on this device or browser.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-foreground">Passkeys</h3>
          <p className="text-xs text-muted-foreground">
            Use a passkey to sign in quickly and securely
          </p>
        </div>
        <Button onClick={handleRegister} disabled={registering} size="sm">
          {registering ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Key className="size-4" />
          )}
          Register a passkey
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {passkeys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-8 mx-auto mb-2 text-muted-foreground/50" />
          No passkeys registered yet.
        </div>
      ) : (
        <div className="space-y-2">
          {passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="flex items-center justify-between rounded-xl border border-border/50 p-3"
            >
              <div className="flex items-center gap-3">
                <Key className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{passkey.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(passkey.createdAt).toLocaleDateString()}
                    {passkey.lastUsedAt && ` · Last used ${new Date(passkey.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(passkey.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                aria-label="Delete passkey"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
