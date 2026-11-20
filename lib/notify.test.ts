import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  NOTIFY_DISMISS_EVENT,
  NOTIFY_SHOW_EVENT,
  notify,
  type ToastMessage,
} from "./notify";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("notify", () => {
  let shown: ToastMessage[];
  let dismissed: number[];

  beforeEach(() => {
    vi.useFakeTimers();
    shown = [];
    dismissed = [];
    window.addEventListener(NOTIFY_SHOW_EVENT, onShow);
    window.addEventListener(NOTIFY_DISMISS_EVENT, onDismiss);
  });

  afterEach(() => {
    window.removeEventListener(NOTIFY_SHOW_EVENT, onShow);
    window.removeEventListener(NOTIFY_DISMISS_EVENT, onDismiss);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function onShow(event: Event) {
    shown.push((event as CustomEvent<ToastMessage>).detail);
  }

  function onDismiss(event: Event) {
    dismissed.push((event as CustomEvent<{ id: number }>).detail.id);
  }

  it("publishes a toast and returns its id", () => {
    const id = notify.success("Saved");

    expect(id).toBeTypeOf("number");
    expect(shown).toEqual([{ id, type: "success", message: "Saved" }]);
  });

  it("auto-dismisses after the configured timeout", () => {
    const id = notify.info("Working", { timeout: 100 });
    expect(dismissed).not.toContain(id);

    vi.advanceTimersByTime(100);

    expect(dismissed).toContain(id);
  });

  it("replaces the loading toast when a promise resolves", async () => {
    const pending = deferred<string>();
    const result = notify.promise(pending.promise, {
      loading: "Converting",
      success: (data) => `Done: ${data}`,
      error: () => "Failed",
    });

    expect(shown).toEqual([
      { id: expect.any(Number), type: "info", message: "Converting" },
    ]);
    const loadingId = shown[0].id;

    pending.resolve("tx-1");
    const finalId = await result;

    expect(dismissed).toContain(loadingId);
    expect(shown[1]).toEqual({
      id: finalId,
      type: "success",
      message: "Done: tx-1",
    });
  });

  it("replaces the loading toast with an error on rejection", async () => {
    const pending = deferred<string>();
    const result = notify.promise(pending.promise, {
      loading: "Converting",
      success: () => "Done",
      error: () => "Conversion failed",
    });
    const loadingId = shown[0].id;

    pending.reject(new Error("offline"));
    const finalId = await result;

    expect(dismissed).toContain(loadingId);
    expect(shown[1]).toEqual({
      id: finalId,
      type: "error",
      message: "Conversion failed",
    });
  });

  it("is a no-op during server rendering", () => {
    vi.stubGlobal("document", undefined);

    expect(notify.success("Saved")).toBeNull();
    expect(shown).toEqual([]);
  });
});
