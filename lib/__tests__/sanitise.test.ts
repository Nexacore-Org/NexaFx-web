import { describe, it, expect } from "vitest";
import { sanitizeInput, stripInvisibleChars } from "@/lib/sanitise";

describe("stripInvisibleChars", () => {
  it("removes zero-width space", () => {
    expect(stripInvisibleChars("hello\u200Bworld")).toBe("helloworld");
  });

  it("removes zero-width joiner", () => {
    expect(stripInvisibleChars("hello\u200Dworld")).toBe("helloworld");
  });

  it("removes zero-width non-joiner", () => {
    expect(stripInvisibleChars("hello\u200Cworld")).toBe("helloworld");
  });

  it("removes BOM character", () => {
    expect(stripInvisibleChars("hello\uFEFFworld")).toBe("helloworld");
  });

  it("removes multiple invisible characters", () => {
    expect(stripInvisibleChars("a\u200Bb\u200Cc")).toBe("abc");
  });

  it("returns clean input unchanged", () => {
    expect(stripInvisibleChars("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(stripInvisibleChars("")).toBe("");
  });
});

describe("sanitizeInput", () => {
  describe("string values", () => {
    it("trims leading and trailing whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("lowercases email when key contains 'email'", () => {
      expect(sanitizeInput("USER@EXAMPLE.COM", "email")).toBe("user@example.com");
    });

    it("lowercases email for 'userEmail' key", () => {
      expect(sanitizeInput("TEST@EXAMPLE.COM", "userEmail")).toBe("test@example.com");
    });

    it("does not lowercase when key is not email-related", () => {
      expect(sanitizeInput("HELLO", "name")).toBe("HELLO");
    });

    it("strips invisible characters from strings", () => {
      expect(sanitizeInput("hel\u200Blo")).toBe("hello");
    });

    it("handles empty string", () => {
      expect(sanitizeInput("")).toBe("");
    });
  });

  describe("array values", () => {
    it("sanitizes each element in an array", () => {
      expect(sanitizeInput(["  hello  ", "  world  "])).toEqual(["hello", "world"]);
    });

    it("handles nested arrays", () => {
      expect(sanitizeInput([["  a  "], "b"])).toEqual([["a"], "b"]);
    });
  });

  describe("object values", () => {
    it("sanitizes each value in an object", () => {
      const input = { name: "  John  ", email: "  TEST@X.COM  " };
      const result = sanitizeInput(input, undefined) as Record<string, unknown>;
      expect(result.name).toBe("John");
      expect(result.email).toBe("test@x.com");
    });

    it("passes correct key to nested sanitization", () => {
      const input = { userEmail: "  TEST@X.COM  " };
      const result = sanitizeInput(input, undefined) as Record<string, unknown>;
      expect(result.userEmail).toBe("test@x.com");
    });
  });

  describe("non-string primitives", () => {
    it("returns numbers unchanged", () => {
      expect(sanitizeInput(42)).toBe(42);
    });

    it("returns booleans unchanged", () => {
      expect(sanitizeInput(true)).toBe(true);
    });

    it("returns null unchanged", () => {
      expect(sanitizeInput(null)).toBe(null);
    });

    it("returns undefined unchanged", () => {
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });
});
