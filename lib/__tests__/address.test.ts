import { truncateAddress } from "../address";

describe("truncateAddress", () => {
  it("returns short addresses unchanged", () => {
    expect(truncateAddress("GABCD")).toBe("GABCD");
    expect(truncateAddress("x".repeat(16))).toBe("x".repeat(16));
  });

  it("is length-gated like the WithdrawalReview variant", () => {
    expect(truncateAddress("x".repeat(15))).toBe("x".repeat(15));
    expect(truncateAddress("x".repeat(16))).toBe("x".repeat(16));
  });

  it("truncates long addresses to 8 + 6 with an ellipsis", () => {
    const full = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const truncated = truncateAddress(full);
    expect(truncated).toHaveLength(8 + 3 + 6);
    expect(truncated.startsWith(full.slice(0, 8))).toBe(true);
    expect(truncated.endsWith(full.slice(-6))).toBe(true);
    expect(truncated).toContain("...");
  });
});
