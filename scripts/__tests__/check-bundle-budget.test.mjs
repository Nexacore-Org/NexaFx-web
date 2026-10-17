import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compareBudgets } from "../check-bundle-budget.mjs";

describe("compareBudgets", () => {
  it("flags routes over budget", () => {
    const sizes = new Map([
      ["/", 100 * 1024],
      ["/dashboard", 500 * 1024],
    ]);
    const rows = compareBudgets(sizes, {
      defaultFirstLoadJsKb: 200,
      routes: { "/dashboard": 400 },
    });
    const home = rows.find((r) => r.route === "/");
    const dash = rows.find((r) => r.route === "/dashboard");
    assert.equal(home.ok, true);
    assert.equal(dash.ok, false);
    assert.ok(dash.deltaKb > 0);
  });
});
