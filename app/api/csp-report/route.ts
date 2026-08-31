import { NextRequest, NextResponse } from "next/server";

// Collects CSP violation reports sent by the browser against the
// Content-Security-Policy-Report-Only header set in middleware.ts. Never
// blocks anything on its own -- this only records what a tightened policy
// would have blocked, so it can be validated before being enforced.
// See SECURITY.md ("CSP Rollout Process").
//
// Browsers may POST either the legacy report-uri shape
// ({"csp-report": {...}}, Content-Type: application/csp-report) or the
// modern Reporting API shape ([{type, url, body}, ...],
// Content-Type: application/reports+json). We accept both.
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    // Malformed report body -- nothing useful to log, but still ack so the
    // browser doesn't retry.
    return new NextResponse(null, { status: 204 });
  }

  const reports = normalizeReports(payload);

  for (const report of reports) {
    // Unconditional console output (not the dev-only `logger` util) so
    // reports show up in production platform logs, which is the whole
    // point -- these are real user sessions, not local dev noise. Tagged
    // so it's easy to grep/filter in whatever log aggregation is in use.
    console.warn(
      "[CSP Report][source=csp-report-only]",
      JSON.stringify(report),
    );
  }

  return new NextResponse(null, { status: 204 });
}

function normalizeReports(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    // Reporting API batch format: [{ type: "csp-violation", body: {...} }, ...]
    return payload;
  }
  if (payload && typeof payload === "object" && "csp-report" in payload) {
    // Legacy report-uri format: { "csp-report": {...} }
    return [(payload as { "csp-report": unknown })["csp-report"]];
  }
  return payload ? [payload] : [];
}
