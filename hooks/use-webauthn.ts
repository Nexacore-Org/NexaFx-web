'use client';

import { useState, useCallback } from 'react';

export function useWebAuthn() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isWebAuthnSupported =
    typeof window !== 'undefined' && !!window.PublicKeyCredential;

  const registerPasskey = useCallback(
    async (options: PublicKeyCredentialCreationOptions) => {
      if (!isWebAuthnSupported) {
        setError('WebAuthn is not supported on this device');
        return null;
      }

      setIsRegistering(true);
      setError(null);

      try {
        const credential = await navigator.credentials.create({
          publicKey: options,
        });

        if (!credential) {
          throw new Error('Passkey registration was cancelled');
        }

        return credential as PublicKeyCredential;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to register passkey';
        setError(message);
        return null;
      } finally {
        setIsRegistering(false);
      }
    },
    [isWebAuthnSupported],
  );

  const authenticateWithPasskey = useCallback(
    async (options: PublicKeyCredentialRequestOptions) => {
      if (!isWebAuthnSupported) {
        setError('WebAuthn is not supported on this device');
        return null;
      }

      setIsAuthenticating(true);
      setError(null);

      try {
        const credential = await navigator.credentials.get({
          publicKey: options,
        });

        if (!credential) {
          throw new Error('Passkey authentication was cancelled');
        }

        return credential as PublicKeyCredential;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to authenticate with passkey';
        setError(message);
        return null;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isWebAuthnSupported],
  );

  return {
    isWebAuthnSupported,
    isRegistering,
    isAuthenticating,
    error,
    registerPasskey,
    authenticateWithPasskey,
  };
}
