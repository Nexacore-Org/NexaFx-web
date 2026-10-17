import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount ?? 0);
  return NextResponse.json({
    usdAmount: (amount / 1500).toFixed(2),
    rate: 1500,
  });
}
