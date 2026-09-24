import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import type { RefObject } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";

function setupContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = `
    <button data-testid="first">First</button>
    <a data-testid="link" href="/">Link</a>
    <input data-testid="input" />
    <button data-testid="last">Last</button>
  `;
  document.body.appendChild(container);
  return container;
}

function pressKey(key: string, shiftKey = false) {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
}

describe("useFocusTrap", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = jest.fn();
    const container = setupContainer();
    const containerRef: RefObject<HTMLDivElement | null> = { current: container };

    renderHook(() => useFocusTrap(true, onClose, containerRef));

    pressKey("Escape");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the first focusable element when opened", () => {
    const container = setupContainer();
    const containerRef: RefObject<HTMLDivElement | null> = { current: container };

    renderHook(() => useFocusTrap(true, jest.fn(), containerRef));

    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="first"]'),
    );
  });

  it("wraps Tab from the last focusable element back to the first", () => {
    const container = setupContainer();
    const containerRef: RefObject<HTMLDivElement | null> = { current: container };
    const last = container.querySelector('[data-testid="last"]') as HTMLElement;

    renderHook(() => useFocusTrap(true, jest.fn(), containerRef));

    act(() => last.focus());
    pressKey("Tab");

    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="first"]'),
    );
  });

  it("wraps Shift+Tab from the first focusable element to the last", () => {
    const container = setupContainer();
    const containerRef: RefObject<HTMLDivElement | null> = { current: container };
    const first = container.querySelector('[data-testid="first"]') as HTMLElement;

    renderHook(() => useFocusTrap(true, jest.fn(), containerRef));

    act(() => first.focus());
    pressKey("Tab", true);

    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="last"]'),
    );
  });

  it("does not throw on Tab when the container has no focusable elements", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const containerRef: RefObject<HTMLDivElement | null> = { current: container };

    renderHook(() => useFocusTrap(true, jest.fn(), containerRef));

    expect(() => pressKey("Tab")).not.toThrow();
  });

  it("registers and cleans up exactly one document keydown listener per open trap", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const removeSpy = jest.spyOn(document, "removeEventListener");
    const containerRef: RefObject<HTMLDivElement | null> = {
      current: setupContainer(),
    };

    const { unmount } = renderHook(() =>
      useFocusTrap(true, jest.fn(), containerRef),
    );

    const keydownAdds = addSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );
    expect(keydownAdds).toHaveLength(1);

    unmount();

    const keydownRemovals = removeSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );
    expect(keydownRemovals).toHaveLength(1);
  });

  it("ignores focusables hidden with display:none when trapping focus", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <button data-testid="hidden" style="display:none">Hidden</button>
      <button data-testid="visible">Visible</button>
      <button data-testid="last">Last</button>
    `;
    document.body.appendChild(container);
    const containerRef: RefObject<HTMLDivElement | null> = { current: container };

    renderHook(() => useFocusTrap(true, jest.fn(), containerRef));

    expect(document.activeElement).toBe(
      container.querySelector('[data-testid="visible"]'),
    );
  });
});