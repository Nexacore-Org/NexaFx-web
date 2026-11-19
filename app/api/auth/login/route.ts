import { NextResponse } from 'next/server';
import { z } from 'zod';

const UPSTREAM_TIMEOUT_MS = 10_000;

const upstreamLoginSchema = z.object({
  sessionToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json(
      {
        error: 'service_unavailable',
        message: 'The authentication service is temporarily unavailable. Please try again later.',
      },
      { status: 503 },
    );
  }

  if (upstream.status >= 500) {
    return NextResponse.json(
      {
        error: 'service_unavailable',
        message: 'The authentication service is temporarily unavailable. Please try again later.',
      },
      { status: 502 },
    );
  }

  if (upstream.status === 401) {
    return NextResponse.json(
      { error: 'invalid_credentials', message: 'Invalid credentials.' },
      { status: 401 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'login_failed', message: 'Unable to complete login.' },
      { status: upstream.status },
    );
  }

  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    return NextResponse.json(
      {
        error: 'service_unavailable',
        message: 'The authentication service returned an invalid response.',
      },
      { status: 502 },
    );
  }

  const parsed = upstreamLoginSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'service_unavailable',
        message: 'The authentication service returned an invalid response.',
      },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', parsed.data.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: parsed.data.expiresIn,
  });
  return response;
}
