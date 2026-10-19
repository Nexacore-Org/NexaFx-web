import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateProductionEnv,
  FORBIDDEN_ENV_KEYS,
} from "../scripts/check-production-env.mjs";

describe("evaluateProductionEnv", () => {
  it("passes in development regardless of forbidden keys", () => {
    const result = evaluateProductionEnv({
      NODE_ENV: "development",
      DEV_TOKEN: "secret",
      TEST_ACCESS_TOKEN: "tok",
      NEXT_PUBLIC_API_MOCKING: "enabled",
    });
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  });

  it("fails when DEV_TOKEN is set in production", () => {
    const result = evaluateProductionEnv({
      NODE_ENV: "production",
      DEV_TOKEN: "should-not-ship",
      NEXT_PUBLIC_API_URL: "https://api.example.com",
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("DEV_TOKEN")));
    // Never leak the value
    assert.ok(!result.errors.some((e) => e.includes("should-not-ship")));
  });

  it("fails when TEST_ACCESS_TOKEN is set under VERCEL_ENV=production", () => {
    const result = evaluateProductionEnv({
      VERCEL_ENV: "production",
      TEST_ACCESS_TOKEN: "x",
      NEXT_PUBLIC_API_URL: "https://api.example.com",
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("TEST_ACCESS_TOKEN")));
  });

  it("fails when NEXT_PUBLIC_API_MOCKING is set in production", () => {
    const result = evaluateProductionEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_API_MOCKING: "enabled",
      NEXT_PUBLIC_API_URL: "https://api.example.com",
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("NEXT_PUBLIC_API_MOCKING")));
  });

  it("fails for unapproved NEXT_PUBLIC_FLAG_* keys", () => {
    const result = evaluateProductionEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_FLAG_EXPERIMENTAL_UI: "1",
      NEXT_PUBLIC_API_URL: "https://api.example.com",
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some((e) => e.includes("NEXT_PUBLIC_FLAG_EXPERIMENTAL_UI")),
    );
  });

  it("fails when NEXT_PUBLIC_API_URL is not https in production", () => {
    const result = evaluateProductionEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_API_URL: "http://insecure.example.com",
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("https://")));
  });

  it("passes a clean production env", () => {
    const result = evaluateProductionEnv({
      NODE_ENV: "production",
      NEXT_PUBLIC_API_URL: "https://api.nexafx.com/v1",
    });
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  });

  it("lists every forbidden key constant", () => {
    assert.ok(FORBIDDEN_ENV_KEYS.includes("DEV_TOKEN"));
    assert.ok(FORBIDDEN_ENV_KEYS.includes("TEST_ACCESS_TOKEN"));
    assert.ok(FORBIDDEN_ENV_KEYS.includes("NEXT_PUBLIC_API_MOCKING"));
  });
});
