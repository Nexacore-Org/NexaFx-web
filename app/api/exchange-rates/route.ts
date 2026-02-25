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
        const externalRes = await fetch(`${BASE_URL}/exchange-rates?from=${from}&to=${to}`, {
            headers: {
                "Content-Type": "application/json",
            },
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
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch exchange rates" },
            { status: 500 }
        );
    }
}
