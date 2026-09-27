import { apiClient } from "../api-client";

export function login(payload: { email: string; password: string }) {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

export function verifyLoginOtp(payload: { email: string; otp: string }) {
  return apiClient("/auth/verify-login-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

export function signup(payload: {
  email: string;
  phone: string;
  password: string;
}) {
  return apiClient("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

export function verifySignupOtp(payload: { email: string; otp: string }) {
  return apiClient("/auth/verify-signup-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

export const signUp = signup;

export function resendSignupOtp(payload: { email: string }) {
  return apiClient("/auth/resend-signup-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

export function resendLoginOtp(payload: { email: string }) {
  return apiClient("/auth/resend-login-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

export interface TwoFactorSetup {
  qrCodeUrl: string
  secret: string
  backupCodes: string[]
}

export const setup2FA = (): Promise<TwoFactorSetup> =>
  apiClient('/auth/2fa/setup', { method: 'POST', useProxy: false })

export const verify2FA = (code: string): Promise<{ backupCodes: string[] }> =>
  apiClient('/auth/2fa/verify', { method: 'POST', useProxy: false, body: JSON.stringify({ code }) })

export const disable2FA = (code: string): Promise<void> =>
  apiClient('/auth/2fa/disable', { method: 'POST', useProxy: false, body: JSON.stringify({ code }) })

export function forgotPassword(payload: { email: string }) {
  return apiClient("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

export function resetPassword(payload: {
  email: string;
  otp: string;
  password: string;
}) {
  /*
      Backend reset-password DTO confirmed to use:
      { email, otp, password }
      - `email`: user email used for forgot-password flow
      - `otp`: 6-digit reset code
      - `password`: new password value
    */
  return apiClient("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

// ---------------------------------------------------------------------------
// WebAuthn / passkey (Face ID, Touch ID, security key) authentication.
//
// TODO(#825): these endpoints are the frontend's integration points for
// biometric login. If the backend does not yet persist WebAuthn credentials,
// implement the matching routes server-side; until then enrollment and
// biometric sign-in degrade gracefully (the UI hides them or surfaces the
// backend error and falls back to the password flow). The browser ceremony
// (navigator.credentials.create/get) lives in lib/auth/passkeys.ts and calls
// through these functions.
// ---------------------------------------------------------------------------

export interface WebauthnRegistrationOptions {
  challenge: string;
  rp: { name: string; id?: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: { type: string; alg: number }[];
  excludeCredentials?: { type: string; id: string }[];
  authenticatorSelection?: Record<string, unknown>;
  timeout?: number;
}

export interface WebauthnAuthenticationOptions {
  challenge: string;
  rpId?: string;
  allowCredentials?: { type: string; id: string }[];
  timeout?: number;
}

export interface WebauthnTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PasskeyInfo {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt?: string;
}

/** TODO(#825): backend must expose POST /auth/webauthn/register/begin. */
export function beginWebauthnRegistration(): Promise<WebauthnRegistrationOptions> {
  return apiClient("/auth/webauthn/register/begin", {
    method: "POST",
    useProxy: false,
  });
}

/** TODO(#825): backend must expose POST /auth/webauthn/register/finish. */
export function finishWebauthnRegistration(
  credential: unknown,
): Promise<PasskeyInfo> {
  return apiClient("/auth/webauthn/register/finish", {
    method: "POST",
    useProxy: false,
    body: JSON.stringify(credential),
  });
}

/** TODO(#825): backend must expose POST /auth/webauthn/authenticate/begin. */
export function beginWebauthnAuthentication(): Promise<WebauthnAuthenticationOptions> {
  return apiClient("/auth/webauthn/authenticate/begin", {
    method: "POST",
    useProxy: false,
  });
}

/** TODO(#825): backend must expose POST /auth/webauthn/authenticate/finish. */
export function finishWebauthnAuthentication(
  credential: unknown,
): Promise<WebauthnTokens> {
  return apiClient("/auth/webauthn/authenticate/finish", {
    method: "POST",
    useProxy: false,
    body: JSON.stringify(credential),
  });
}

/** TODO(#825): backend must expose GET /auth/webauthn/passkeys. */
export function listPasskeys(): Promise<PasskeyInfo[]> {
  return apiClient("/auth/webauthn/passkeys", {
    method: "GET",
    useProxy: false,
  });
}

/** TODO(#825): backend must expose DELETE /auth/webauthn/passkeys/:id. */
export function deletePasskey(id: string): Promise<void> {
  return apiClient(`/auth/webauthn/passkeys/${id}`, {
    method: "DELETE",
    useProxy: false,
  });
}
