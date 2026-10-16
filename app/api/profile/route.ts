import { NextResponse } from "next/server";

interface ProfileUpdate {
  firstName?: string | null;
  lastName?: string | null;
}

export async function PATCH(request: Request) {
  let body: ProfileUpdate;
  try {
    body = (await request.json()) as ProfileUpdate;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (
    body.firstName !== undefined &&
    typeof body.firstName !== "string" &&
    body.firstName !== null
  ) {
    return NextResponse.json(
      { error: "firstName must be a string" },
      { status: 422 },
    );
  }
  if (
    body.lastName !== undefined &&
    typeof body.lastName !== "string" &&
    body.lastName !== null
  ) {
    return NextResponse.json(
      { error: "lastName must be a string" },
      { status: 422 },
    );
  }

  // In a real deployment this would persist to the backend and return the
  // canonical user record. Here we echo the accepted update.
  return NextResponse.json({
    user: {
      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
    },
  });
}
