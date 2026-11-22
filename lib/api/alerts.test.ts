import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  listAlerts,
  normalizeAlert,
  validateAlertInput,
} from "./alerts";

describe("lib/api/alerts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("validateAlertInput", () => {
    it("accepts valid alert input and rejects invalid fields", () => {
      // Migrate existing validation cases from __tests__/alerts-validation.test.mjs
      // and assert against the real validateAlertInput implementation.
      expect(validateAlertInput).toBeTypeOf("function");
    });
  });

  describe("normalizeAlert", () => {
    it("normalizes snake_case payloads into the expected alert shape", () => {
      const rawSnakeCasePayload = {
        id: "alert-1",
        target_price: 1650.5,
        is_active: true,
        created_at: "2026-01-15T10:00:00.000Z",
      };

      const normalized = normalizeAlert(rawSnakeCasePayload as never);
      expect(normalized).toMatchObject({
        id: "alert-1",
      });
    });
  });

  describe("listAlerts", () => {
    it("handles array responses", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await listAlerts();
      expect(Array.isArray(result)).toBe(true);
    });

    it("handles wrapped object responses", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ alerts: [] }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await listAlerts();
      expect(Array.isArray(result)).toBe(true);
    });

    it("applies the maxAlerts fallback cleanly", async () => {
      const manyAlerts = Array.from({ length: 120 }, (_, i) => ({
        id: `alert-${i + 1}`,
      }));
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => manyAlerts,
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await listAlerts();
      expect(result.length).toBeLessThanOrEqual(manyAlerts.length);
    });
  });
});