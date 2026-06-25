import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { resetNavigationMocks } from "./mocks/navigation";
import { server } from "./msw/server";

function createStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: sessionStorageMock,
  configurable: true,
});

type LinkMockProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string };
  children?: ReactNode;
};

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: LinkMockProps) => (
    <a href={typeof href === "string" ? href : href.pathname ?? ""} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", async () => {
  const navigation = await import("./mocks/navigation");

  return {
    useRouter: () => navigation.mockRouter,
    useSearchParams: () => navigation.getMockSearchParams(),
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetNavigationMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
  vi.clearAllMocks();
});

afterAll(() => server.close());
