/**
 * Native WebAuthn / passkey ceremony (Face ID, Touch ID, security keys).
 *
 * Uses only the built-in `navigator.credentials` API -- no external
 * WebAuthn client library required. Server round-trips go through the
 * TODO-marked endpoints in `@/lib/api/auth` (#825).
 */
import {
  beginWebauthnRegistration,
  finishWebauthnRegistration,
  beginWebauthnAuthentication,
  finishWebauthnAuthentication,
  listPasskeys as apiListPasskeys,
  deletePasskey as apiDeletePasskey,
  type PasskeyInfo,
  type WebauthnTokens,
} from "@/lib/api/auth";

export type { PasskeyInfo };

/** False on browsers/devices without platform WebAuthn support. */
export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.credentials
  );
}

function base64UrlToBuffer(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Enroll a new biometric credential for the signed-in user
 * (Settings > Security > "Sign in with Face ID / Touch ID").
 */
export async function registerPasskey(): Promise<PasskeyInfo> {
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported on this device or browser.");
  }
  const options = await beginWebauthnRegistration();
  const credential = (await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: base64UrlToBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64UrlToBuffer(options.user.id),
      },
      excludeCredentials: options.excludeCredentials?.map((c) => ({
        ...c,
        type: "public-key" as const,
        id: base64UrlToBuffer(c.id),
      })),
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Passkey registration was cancelled.");

  const response = credential.response as AuthenticatorAttestationResponse;
  return finishWebauthnRegistration({
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferToBase64Url(response.attestationObject),
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
    },
  });
}

/**
 * Sign in with an enrolled biometric credential. Resolves with session
 * tokens on success; rejects (user falls back to password) otherwise.
 */
export async function authenticateWithPasskey(): Promise<WebauthnTokens> {
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported on this device or browser.");
  }
  const options = await beginWebauthnAuthentication();
  const credential = (await navigator.credentials.get({
    publicKey: {
      ...options,
      challenge: base64UrlToBuffer(options.challenge),
      allowCredentials: options.allowCredentials?.map((c) => ({
        ...c,
        type: "public-key" as const,
        id: base64UrlToBuffer(c.id),
      })),
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Passkey authentication was cancelled.");

  const response = credential.response as AuthenticatorAssertionResponse;
  return finishWebauthnAuthentication({
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle
        ? bufferToBase64Url(response.userHandle)
        : null,
    },
  });
}

export const getPasskeys = apiListPasskeys;
export const deletePasskey = apiDeletePasskey;
