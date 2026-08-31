import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Group name shared between the Reporting-Endpoints header (modern) and the
// report-to directive that references it, per the Reporting API spec.
const REPORT_GROUP = "csp-endpoint";
const REPORT_URI_PATH = "/api/csp-report";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Report-only candidate for the next tightening step: drops style-src's
  // remaining 'unsafe-inline'. This never blocks anything -- it only reports
  // what WOULD break if that keyword were removed from the enforced policy
  // above, so we can validate against real traffic before flipping it on.
  // See SECURITY.md ("CSP Rollout Process") for how to graduate this.
  const reportOnlyCspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    report-uri ${REPORT_URI_PATH};
    report-to ${REPORT_GROUP};
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    reportOnlyCspHeader,
  );

  // Defines the "csp-endpoint" group referenced by the report-to directive
  // above (modern Reporting API). report-uri is kept alongside it as a
  // widely-supported fallback for browsers that don't yet honor report-to.
  response.headers.set(
    "Reporting-Endpoints",
    `${REPORT_GROUP}="${REPORT_URI_PATH}"`,
  );

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
