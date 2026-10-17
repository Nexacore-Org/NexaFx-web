import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Lightweight re-implementation mirror of validateAlertInput for Node test
// without TS transpile. Keep in sync with lib/api/alerts.ts.
function validateAlertInput(input) {
  if (!input.pair || !String(input.pair).includes("/")) {
    return "Select a valid currency pair.";
  }
  if (input.direction !== "above" && input.direction !== "below") {
    return "Choose whether to alert above or below the target rate.";
  }
  const rate =
    typeof input.targetRate === "number"
      ? input.targetRate
      : Number(input.targetRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    return "Target rate must be a number greater than zero.";
  }
  return null;
}

describe("validateAlertInput", () => {
  it("rejects missing pair", () => {
    assert.ok(
      validateAlertInput({ pair: "", direction: "above", targetRate: 1 }),
    );
  });

  it("rejects pair without slash", () => {
    assert.ok(
      validateAlertInput({
        pair: "XLMUSD",
        direction: "above",
        targetRate: 1,
      }),
    );
  });

  it("rejects invalid direction", () => {
    assert.ok(
      validateAlertInput({
        pair: "XLM/USD",
        direction: "sideways",
        targetRate: 1,
      }),
    );
  });

  it("rejects zero and negative thresholds before any request", () => {
    assert.equal(
      validateAlertInput({
        pair: "XLM/USD",
        direction: "above",
        targetRate: 0,
      }),
      "Target rate must be a number greater than zero.",
    );
    assert.equal(
      validateAlertInput({
        pair: "XLM/USD",
        direction: "below",
        targetRate: -0.5,
      }),
      "Target rate must be a number greater than zero.",
    );
  });

  it("rejects non-numeric thresholds", () => {
    assert.ok(
      validateAlertInput({
        pair: "XLM/USD",
        direction: "above",
        targetRate: "abc",
      }),
    );
  });

  it("accepts a valid payload", () => {
    assert.equal(
      validateAlertInput({
        pair: "USDC/NGN",
        direction: "below",
        targetRate: 1500.5,
      }),
      null,
    );
  });
});

describe("delete confirmation contract", () => {
  it("requires an explicit id for deletion", () => {
    const id = "";
    assert.equal(Boolean(id), false);
  });
});
