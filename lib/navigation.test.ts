import { beforeEach, describe, expect, it, vi } from "vitest";

const { flags } = vi.hoisted(() => ({
  flags: {
    developer: false,
    beneficiaries: false,
    schedules: false,
  },
}));

vi.mock("@/lib/api/api-keys", () => ({
  get DEVELOPER_ENABLED() {
    return flags.developer;
  },
}));
vi.mock("@/lib/api/beneficiaries", () => ({
  get BENEFICIARIES_ENABLED() {
    return flags.beneficiaries;
  },
}));
vi.mock("@/lib/api/schedules", () => ({
  get SCHEDULES_ENABLED() {
    return flags.schedules;
  },
}));

type NavigationModule = typeof import("@/lib/navigation");

async function loadNavigation(): Promise<NavigationModule> {
  vi.resetModules();
  return import("@/lib/navigation");
}

describe("dashboard navigation", () => {
  beforeEach(() => {
    flags.developer = false;
    flags.beneficiaries = false;
    flags.schedules = false;
  });

  it("exposes alerts and KYC alongside the existing routes", async () => {
    const { navItems } = await loadNavigation();
    const hrefs = navItems.map((item) => item.href);

    expect(hrefs).toContain("/alerts");
    expect(hrefs).toContain("/kyc");
    expect(hrefs).toContain("/transactions");
    expect(navItems.every((item) => item.label && item.title)).toBe(true);
  });

  it("hides beneficiaries and schedules behind their flags", async () => {
    let { navItems } = await loadNavigation();
    let hrefs = navItems.map((item) => item.href);
    expect(hrefs).not.toContain("/beneficiaries");
    expect(hrefs).not.toContain("/schedules");

    flags.beneficiaries = true;
    flags.schedules = true;
    ({ navItems } = await loadNavigation());
    hrefs = navItems.map((item) => item.href);
    expect(hrefs).toContain("/beneficiaries");
    expect(hrefs).toContain("/schedules");
  });

  it("derives topbar titles, including nested routes", async () => {
    const { deriveTitle } = await loadNavigation();

    expect(deriveTitle("/alerts")).toBe("Alerts");
    expect(deriveTitle("/alerts/42")).toBe("Alerts");
    expect(deriveTitle("/kyc/review")).toBe("KYC");
    expect(deriveTitle("/somewhere-else")).toBe("NexaFx");
  });

  it("derives gated titles only while the flags are on", async () => {
    let { deriveTitle } = await loadNavigation();
    expect(deriveTitle("/beneficiaries/new")).toBe("NexaFx");
    expect(deriveTitle("/schedules/123")).toBe("NexaFx");

    flags.beneficiaries = true;
    flags.schedules = true;
    ({ deriveTitle } = await loadNavigation());
    expect(deriveTitle("/beneficiaries/new")).toBe("Beneficiaries");
    expect(deriveTitle("/schedules/123")).toBe("Schedules");
  });
});
