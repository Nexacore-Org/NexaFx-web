import { NextResponse } from "next/server";

/** Fixed-rate quote stub, only reachable in E2E/test mode. */
export async function POST(request: Request) {
  const useMock =
    process.env.E2E_MOCK === "1" || process.env.NODE_ENV === "test";
  if (!useMock) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount ?? 0);
  return NextResponse.json({
    usdAmount: (amount / 1500).toFixed(2),
    rate: 1500,
  });
}
