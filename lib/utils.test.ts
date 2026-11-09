import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("lib/utils (cn)", () => {
  it("merges simple class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes correctly", () => {
    const isPrimary = true;
    const isLarge = false;
    expect(cn("base-btn", isPrimary && "btn-primary", isLarge && "btn-lg")).toBe(
      "base-btn btn-primary"
    );
  });

  it("merges conflicting Tailwind utilities resolving to the last applied", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("ignores null, undefined, and boolean values", () => {
    expect(cn("foo", null, undefined, false, true, "bar")).toBe("foo bar");
  });
});
