import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getAdminRoleFromToken, middleware } from "./middleware";

function createJwt(role: "ADMIN" | "USER") {
  return [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify({ role })).toString("base64url"),
    "signature",
  ].join(".");
}

describe("middleware admin enforcement", () => {
  it("extracts the role from a JWT access token", () => {
    expect(getAdminRoleFromToken(createJwt("ADMIN"))).toBe("ADMIN");
    expect(getAdminRoleFromToken(createJwt("USER"))).toBe("USER");
  });

  it("redirects unauthenticated users away from admin routes", () => {
    const response = middleware(new NextRequest("http://localhost/admin/users"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/sign-in");
  });

  it("redirects non-admin users away from admin routes", () => {
    const request = new NextRequest("http://localhost/admin/users", {
      headers: {
        cookie: `access_token=${createJwt("USER")}`,
      },
    });

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });
});
