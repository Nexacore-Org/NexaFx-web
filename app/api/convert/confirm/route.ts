import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.amount) {
    return NextResponse.json({ error: "Missing amount" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: `cvt-${Date.now()}` });
}
