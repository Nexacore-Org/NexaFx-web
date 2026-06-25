import { apiClient } from "../api-client";

export const login = (email: string, password: string) => {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    useProxy: false,
  });
};

export const verifyLoginOtp = (email: string, otp: string) => {
  return apiClient("/auth/verify-login-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
    useProxy: false,
  });
};

export const resendOtp = (email: string) => {
  return apiClient("/auth/resend-login-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
    useProxy: false,
  });
};

export function signUp(payload: {
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

export function resendSignupOtp(payload: { email: string }) {
  return apiClient("/auth/resend-signup-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}

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
  return apiClient("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    useProxy: false,
  });
}
