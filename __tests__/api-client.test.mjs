import { test } from "node:test";
import assert from "node:assert/strict";

import { apiRequest, ApiError } from "../lib/api-client.ts";

function mockFetch(response) {
  const original = globalThis.fetch;
  globalThis.fetch = async () => response;
  return () => {
    globalThis.fetch = original;
  };
}

test("apiRequest resolves undefined for a 204 No Content response", async () => {
  const restore = mockFetch(new Response(null, { status: 204 }));
  try {
    const result = await apiRequest("/api/auth/sessions/abc", {
      method: "DELETE",
      skipAuth: true,
    });
    assert.equal(result, undefined);
  } finally {
    restore();
  }
});

test("apiRequest resolves undefined for an empty 200 body", async () => {
  const restore = mockFetch(
    new Response("", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  try {
    const result = await apiRequest("/api/empty", { skipAuth: true });
    assert.equal(result, undefined);
  } finally {
    restore();
  }
});

test("apiRequest throws for a 200 with a non-JSON body", async () => {
  const restore = mockFetch(
    new Response("<html>ok</html>", {
      status: 200,
      headers: { "content-type": "text/html" },
    }),
  );
  try {
    await assert.rejects(
      () => apiRequest("/api/html", { skipAuth: true }),
      (err) =>
        err instanceof ApiError &&
        err.message === "Unexpected non-JSON response" &&
        err.status === 200,
    );
  } finally {
    restore();
  }
});
