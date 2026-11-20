import { describe, expect, it } from "vitest";
import {
  isSafeRedirect,
  loginRedirectFor,
  safeRedirect,
} from "@/lib/safe-redirect";

describe("isSafeRedirect", () => {
  it("accepts same-site paths", () => {
    expect(isSafeRedirect("/dashboard")).toBe(true);
    expect(isSafeRedirect("/convert?from=NGN&to=USD")).toBe(true);
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(isSafeRedirect("//evil.com")).toBe(false);
    expect(isSafeRedirect("https://evil.com")).toBe(false);
    expect(isSafeRedirect("https://x")).toBe(false);
    expect(isSafeRedirect("/\\evil.com")).toBe(false);
    expect(isSafeRedirect("http://evil.com/path")).toBe(false);
  });

  it("rejects encoded variants that would decode to an off-site target", () => {
    expect(isSafeRedirect("/%2F%2Fevil.com")).toBe(true);
    expect(isSafeRedirect("https:/\\evil.com")).toBe(false);
    expect(isSafeRedirect("/\t/evil.com")).toBe(false);
  });

  it("rejects empty, missing or non-leading-slash values", () => {
    expect(isSafeRedirect("")).toBe(false);
    expect(isSafeRedirect(null)).toBe(false);
    expect(isSafeRedirect(undefined)).toBe(false);
    expect(isSafeRedirect("dashboard")).toBe(false);
  });
});

describe("safeRedirect", () => {
  it("returns the path when safe", () => {
    expect(safeRedirect("/settings")).toBe("/settings");
  });

  it("falls back to the dashboard for unsafe values", () => {
    expect(safeRedirect("//evil.com")).toBe("/dashboard");
    expect(safeRedirect("https://x")).toBe("/dashboard");
    expect(safeRedirect(null)).toBe("/dashboard");
  });

  it("honours a custom fallback", () => {
    expect(safeRedirect("//evil.com", "/home")).toBe("/home");
  });
});

describe("loginRedirectFor", () => {
  it("preserves a safe next path", () => {
    expect(loginRedirectFor("/settings")).toBe("/login?next=%2Fsettings");
  });

  it("drops an unsafe next path in favour of the fallback", () => {
    expect(loginRedirectFor("//evil.com")).toBe("/login?next=%2Fdashboard");
  });
});
