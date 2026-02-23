export async function getExchangeRate(from: string, to: string) {
    const res = await fetch(`/api/exchange-rates?from=${from}&to=${to}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || data?.message || res.statusText);
    }

    return res.json();
}
