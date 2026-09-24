import { describe, expect, it } from "vitest";
import { getDiceBearSeed } from "./profile-overview";

describe("getDiceBearSeed", () => {
  it("URL-encodes unsafe characters before sending the DiceBear seed", () => {
    expect(getDiceBearSeed("Jane & Doe?")).toBe("Jane%20%26%20Doe%3F");
  });

  it("caps very long names before generating the DiceBear seed", () => {
    const value = "A".repeat(200);
    expect(getDiceBearSeed(value)).toHaveLength(64);
  });
});
