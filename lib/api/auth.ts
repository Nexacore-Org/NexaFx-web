import { apiClient } from "../api-client";

export function login (payload: { email: string; password: string }) {
    return apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
        useProxy: false,
    });
}

export function verifyLoginOtp (payload: { email: string; otp: string }) {
    return apiClient("/auth/verify-login-otp", {
        method: "POST",
        body: JSON.stringify(payload),
        useProxy: false,
    });
}

export function signUp (payload: {
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

export function verifySignupOtp (payload: { email: string; otp: string }) {
    return apiClient("/auth/verify-signup-otp", {
        method: "POST",
        body: JSON.stringify(payload),
        useProxy: false,
    });
}

export function resendSignupOtp (payload: { email: string }) {
    return apiClient("/auth/resend-signup-otp", {
        method: "POST",
        body: JSON.stringify(payload),
        useProxy: false,
    });
}

export function resendLoginOtp (payload: { email: string }) {
    return apiClient("/auth/resend-login-otp", {
        method: "POST",
        body: JSON.stringify(payload),
        useProxy: false,
    });
}

export function forgotPassword (payload: { email: string }) {
    return apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
        useProxy: false,
    });
}

export function resetPassword (payload: {
    email: string;
    otp: string;
    newPassword: string;
}) {
    return apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload),
        useProxy: false,
    });
}
