const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(path: string, body: object): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || res.statusText);
    }

    return res.json();
}

export function signUp(payload: {
    email: string;
    phone: string;
    password: string;
}) {
    return request("/auth/signup", payload);
}

export function verifySignupOtp(payload: { email: string; otp: string }) {
    return request("/auth/verify-signup-otp", payload);
}

export function resendSignupOtp(payload: { email: string }) {
    return request("/auth/resend-signup-otp", payload);
}

export function forgotPassword(payload: { email: string }) {
    return request("/auth/forgot-password", payload);
}

export function resetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
}) {
    return request("/auth/reset-password", payload);
}
