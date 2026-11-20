import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateAuditExceptions, filterAuditReport } from "../scripts/check-audit-exceptions.mjs";

describe("evaluateAuditExceptions", () => {
  it("passes when there are no exception headings", () => {
    const result = evaluateAuditExceptions("# Audit exceptions\n\nNone.\n");
    assert.equal(result.ok, true);
    assert.deepEqual(result.expired, []);
  });

  it("passes a future-dated exception", () => {
    const md = `
## lodash — GHSA-xxxx
- reason: waiting on upstream
- expires: 2099-01-01
`;
    const result = evaluateAuditExceptions(md, new Date("2026-10-17"));
    assert.equal(result.ok, true);
    assert.equal(result.expired.length, 0);
  });

  it("fails when an exception has expired", () => {
    const md = `
## left-pad — GHSA-old
- reason: demo
- expires: 2020-01-01
`;
    const result = evaluateAuditExceptions(md, new Date("2026-10-17"));
    assert.equal(result.ok, false);
    assert.equal(result.expired.length, 1);
    assert.equal(result.expired[0].package, "left-pad");
    assert.equal(result.expired[0].advisory, "GHSA-old");
  });

  it("reports parse errors for missing expires", () => {
    const md = `
## broken — GHSA-1
- reason: no date
`;
    const result = evaluateAuditExceptions(md);
    assert.equal(result.ok, false);
    assert.ok(result.parseErrors.length > 0);
  });
});

describe("filterAuditReport (#1134)", () => {
  const report = {
    vulnerabilities: {
      lodash: { via: [{ source: 1, url: "https://github.com/advisories/GHSA-aaaa", severity: "high" }] },
      minimist: { via: [{ source: 2, url: "https://github.com/advisories/GHSA-bbbb", severity: "critical" }] },
      chalk: { via: [{ source: 3, url: "https://github.com/advisories/GHSA-cccc", severity: "moderate" }] },
    },
  };
  const now = new Date("2026-10-17");

  it("drops advisories listed with a future expiry", () => {
    const md = "## lodash — GHSA-aaaa\n- reason: x\n- expires: 2099-01-01\n";
    assert.deepEqual(filterAuditReport(report, md, now).map((r) => r.package), ["minimist"]);
  });

  it("keeps advisories whose exception has expired", () => {
    const md = "## lodash — GHSA-aaaa\n- reason: x\n- expires: 2020-01-01\n";
    assert.deepEqual(filterAuditReport(report, md, now).map((r) => r.package), ["lodash", "minimist"]);
  });

  it("ignores moderate and below", () => {
    assert.equal(filterAuditReport(report, "", now).some((r) => r.package === "chalk"), false);
  });
});
