import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
        return NextResponse.json(
            { error: 'Missing "from" or "to" query parameters' },
            { status: 400 }
        );
    }

    try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexafx-backend.onrender.com/v1";

        // Forward the caller's token when present. The backend may treat /exchange-rates
        // as public or optionally authenticated (e.g. for personalised rates); unauthenticated
        // requests still proceed without an Authorization header.
        const token =
            req.headers.get("x-client-token") ??
            req.cookies.get("access_token")?.value;

        const headers = new Headers({ "Content-Type": "application/json" });
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        const externalRes = await fetch(`${BASE_URL}/exchange-rates?from=${from}&to=${to}`, {
            headers,
        });

        if (!externalRes.ok) {
            const errorData = await externalRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData?.message || externalRes.statusText },
                { status: externalRes.status }
            );
        }

        const data = await externalRes.json();
        return NextResponse.json(data);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch exchange rates" },
            { status: 500 }
        );
    }
}