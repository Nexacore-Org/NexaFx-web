import { vi } from "vitest";

export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockBack = vi.fn();

export const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

let searchParams = new URLSearchParams();

export function setMockSearchParams(value: string) {
  searchParams = new URLSearchParams(value);
}

export function getMockSearchParams() {
  return searchParams;
}

export function resetNavigationMocks() {
  searchParams = new URLSearchParams();
}
