export async function getExchangeRate(from: string, to: string) {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const headers = new Headers({ "Content-Type": "application/json" });
    if (token) {
        headers.set("x-client-token", token);
    }

    const res = await fetch(`/api/exchange-rates?from=${from}&to=${to}`, {
        method: "GET",
        headers,
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || data?.message || res.statusText);
    }

    return res.json();
}
