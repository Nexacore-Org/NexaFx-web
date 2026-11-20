import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(__dirname, "..", "components", "dashboard", "withdrawal", "WithdrawalSuccess.tsx"),
  "utf8",
);

// Extract the status mapper so we can exercise it without a JSX runtime.
function loadStatusMapper() {
  const match = source.match(
    /export\s+function\s+mapTransactionStatus[\s\S]*?\n}\n/,
  );
  assert.ok(match, "mapTransactionStatus should be exported from WithdrawalSuccess.tsx");
  const body = match[0].replace(/export\s+/, "");
  // eslint-disable-next-line no-new-func
  return new Function(`${body}\nreturn mapTransactionStatus;`)();
}

test("maps completed transactions to Completed", () => {
  const mapTransactionStatus = loadStatusMapper();
  assert.equal(mapTransactionStatus("completed"), "Completed");
});

test("maps failed transactions to Failed", () => {
  const mapTransactionStatus = loadStatusMapper();
  assert.equal(mapTransactionStatus("failed"), "Failed");
});

test("maps pending transactions to Pending", () => {
  const mapTransactionStatus = loadStatusMapper();
  assert.equal(mapTransactionStatus("pending"), "Pending");
});

test("treats completed and failed as final states", () => {
  const match = source.match(
    /export\s+function\s+isFinalTransactionStatus[\s\S]*?\n}\n/,
  );
  assert.ok(match, "isFinalTransactionStatus should be exported from WithdrawalSuccess.tsx");
  const body = match[0].replace(/export\s+/, "");
  // eslint-disable-next-line no-new-func
  const isFinalTransactionStatus = new Function(`${body}\nreturn isFinalTransactionStatus;`)();
  assert.equal(isFinalTransactionStatus("completed"), true);
  assert.equal(isFinalTransactionStatus("failed"), true);
  assert.equal(isFinalTransactionStatus("pending"), false);
});
