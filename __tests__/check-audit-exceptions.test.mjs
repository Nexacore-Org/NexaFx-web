import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateAuditExceptions } from "../scripts/check-audit-exceptions.mjs";

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
