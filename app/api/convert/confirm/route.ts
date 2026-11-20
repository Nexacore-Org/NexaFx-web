import { NextResponse } from "next/server";

/** Conversion-confirm stub, only reachable in E2E/test mode. */
export async function POST(request: Request) {
  const useMock =
    process.env.E2E_MOCK === "1" || process.env.NODE_ENV === "test";
  if (!useMock) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.amount) {
    return NextResponse.json({ error: "Missing amount" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: `cvt-${Date.now()}` });
}
