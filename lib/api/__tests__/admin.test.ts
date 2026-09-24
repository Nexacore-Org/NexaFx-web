import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("../api-client", () => ({
  apiClient: jest.fn(),
}));

import { mapAdminUser, getAdminUsers } from "@/lib/api/admin";
import { apiClient } from "@/lib/api-client";

const mockedApiClient = apiClient as unknown as jest.Mock;

describe("mapAdminUser", () => {
  it("normalizes camelCase backend fields", () => {
    const result = mapAdminUser({
      id: "u1",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+1 555 0100",
      walletAddress: "GABC",
      username: "ada",
      avatarUrl: "https://example.com/avatar.png",
      transactions: 4,
      totalDeposit: 1000.5,
      totalWithdraw: 200.25,
      kycStatus: "Verified",
      createdAt: "2026-01-15T10:00:00.000Z",
      twoFactorEnabled: true,
      isActive: true,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "u1",
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        phone: "+1 555 0100",
        walletAddress: "GABC",
        username: "ada",
        avatarUrl: "https://example.com/avatar.png",
        transactions: 4,
        totalDeposit: 1000.5,
        totalWithdraw: 200.25,
        kycStatus: "Verified",
        twoFactorEnabled: true,
        isActive: true,
      }),
    );
    expect(result.createdAt).not.toBe("");
  });

  it("normalizes snake_case backend fields", () => {
    const result = mapAdminUser({
      _id: "u2",
      email: "grace@example.com",
      first_name: "Grace",
      last_name: "Hopper",
      wallet_address: "GXYZ",
      address: "GADDR",
      avatar_url: "https://example.com/g.png",
      total_deposit: "5000",
      total_withdraw: "500",
      kyc_status: "verified",
      created_at: "2026-02-20T10:00:00.000Z",
      two_factor_enabled: false,
      is_active: false,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: "u2",
        firstName: "Grace",
        lastName: "Hopper",
        walletAddress: "GXYZ", // wallet_address takes precedence over address
        avatarUrl: "https://example.com/g.png",
        totalDeposit: 5000,
        totalWithdraw: 500,
        kycStatus: "Verified",
        twoFactorEnabled: false,
        isActive: false,
        createdAtRaw: "2026-02-20T10:00:00.000Z",
      }),
    );
  });

  it("falls back to the bare `address` field when neither camelCase nor a wallet address is present", () => {
    const result = mapAdminUser({ id: "u3", address: "GSTEL" });
    expect(result.walletAddress).toBe("GSTEL");
  });

  it("handles missing/null fields with sensible defaults", () => {
    const result = mapAdminUser({});

    expect(result).toEqual({
      id: "",
      email: "",
      firstName: null,
      lastName: null,
      phone: null,
      walletAddress: "",
      username: "",
      avatarUrl: null,
      transactions: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      kycStatus: "Unverified",
      createdAt: "",
      createdAtRaw: undefined,
      twoFactorEnabled: undefined,
      isActive: true,
    });
  });

  it("derives a username from the email when none is provided", () => {
    const result = mapAdminUser({ email: "ada@example.com" });
    expect(result.username).toBe("ada");
  });

  it("normalizes the kycStatus enum to Verified only for verified variants", () => {
    expect(mapAdminUser({ kycStatus: "Verified" }).kycStatus).toBe("Verified");
    expect(mapAdminUser({ kycStatus: "verified" }).kycStatus).toBe("Verified");
    expect(mapAdminUser({ kyc_status: "Verified" }).kycStatus).toBe("Verified");
    expect(mapAdminUser({ kycStatus: "SomethingElse" }).kycStatus).toBe(
      "Unverified",
    );
    expect(mapAdminUser({}).kycStatus).toBe("Unverified");
  });
});

describe("getAdminUsers (limit fallback)", () => {
  beforeEach(() => {
    mockedApiClient.mockReset();
  });

  it("requests a limited set via the limit query param", async () => {
    mockedApiClient.mockResolvedValue({
      data: Array.from({ length: 5 }, (_, i) => ({
        id: `u${i}`,
        email: `u${i}@example.com`,
      })),
      total: 5,
    });

    const result = await getAdminUsers({ page: 1, limit: 5 });

    expect(mockedApiClient).toHaveBeenCalledWith(
      "/admin/users",
      expect.objectContaining({
        params: expect.objectContaining({ page: "1", limit: "5" }),
      }),
    );
    expect(result.data).toHaveLength(5);
    expect(result.total).toBe(5);
  });

  it("trims locally when the backend ignores the limit parameter", async () => {
    // Backend returns the full admin user set despite limit: 5.
    mockedApiClient.mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => ({
        id: `u${i}`,
        email: `u${i}@example.com`,
      })),
      total: 20,
    });

    const result = await getAdminUsers({ page: 1, limit: 5 });

    expect(result.data).toHaveLength(5);
    expect(result.total).toBe(20);
  });

  it("does not slice when no limit is requested", async () => {
    mockedApiClient.mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => ({
        id: `u${i}`,
        email: `u${i}@example.com`,
      })),
      total: 20,
    });

    const result = await getAdminUsers({});

    expect(result.data).toHaveLength(20);
  });
});
