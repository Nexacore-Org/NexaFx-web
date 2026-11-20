import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = join(root, "app", "(auth)", "reset-password", "page.tsx");
const unusedFormPath = join(
  root,
  "app",
  "(auth)",
  "reset-password",
  "reset-password-form.tsx",
);

const pageSource = readFileSync(pagePath, "utf8");

test("unused reset-password-form.tsx has been deleted", () => {
  assert.equal(
    existsSync(unusedFormPath),
    false,
    "reset-password-form.tsx should no longer exist",
  );
});

test("reset-password page renders an expired-link state when code is missing", () => {
  assert.match(
    pageSource,
    /invalid-or-expired/i,
    "page should render an invalid-or-expired-link state",
  );
  assert.match(
    pageSource,
    /\/forgot-password/,
    "expired-link state should link to /forgot-password",
  );
});

test("reset-password page guards the form behind a non-empty code", () => {
  assert.match(
    pageSource,
    /!code/,
    "page should check for a missing/empty code before rendering the form",
  );
});
