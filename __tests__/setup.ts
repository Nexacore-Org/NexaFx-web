import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw-server";

// Start the MSW request interceptor before any test runs.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset any per-test request handler overrides and unmount React trees.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
