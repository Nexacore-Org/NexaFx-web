"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint } from "lucide-react";
import {
  authenticateWithPasskey,
  isPasskeySupported,
} from "@/lib/auth/passkeys";
import { getProfile } from "@/lib/api/users";
import { useAuthStore } from "@/hooks/use-auth-store";

/**
 * "Sign in with Face ID / Touch ID" button for the sign-in pages.
 *
 * Renders nothing on devices/browsers without WebAuthn support so the
 * feature degrades gracefully to the password flow. On success it stores
 * the session (same setAuth shape the profile overview uses) and routes
 * home; on failure it surfaces the error and leaves the password form
 * untouched for fallback.
 */
export function PasskeySignInButton() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Graceful degradation: no WebAuthn support, no biometric option.
  if (!isPasskeySupported()) return null;

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { accessToken, refreshToken } = await authenticateWithPasskey();
      const profile = await getProfile();
      setAuth(
        {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          email: profile.email,
          role: "USER",
        },
        accessToken,
        refreshToken,
      );
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Biometric sign-in failed. Use your password instead.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full py-2.5 bg-muted hover:bg-muted/70 text-foreground font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 border border-border"
      >
        <Fingerprint className="size-4" aria-hidden="true" />
        {isLoading
          ? "Verifying biometrics..."
          : "Sign in with Face ID / Touch ID"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
