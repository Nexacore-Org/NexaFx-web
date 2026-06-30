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
