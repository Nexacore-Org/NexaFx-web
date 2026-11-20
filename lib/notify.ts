export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

export const NOTIFY_SHOW_EVENT = "notify:show";
export const NOTIFY_DISMISS_EVENT = "notify:dismiss";

let toastId = 0;
const toastTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

/** Dismiss a toast by id, cancelling its pending auto-dismiss timer. */
export function dismissToast(id: number): void {
  const timer = toastTimeouts.get(id);
  if (timer !== undefined) clearTimeout(timer);
  toastTimeouts.delete(id);

  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NOTIFY_DISMISS_EVENT, { detail: { id } }),
  );
}

/**
 * Publish a toast and return its id (or `null` when called during SSR).
 * `timeout: 0` keeps the toast until it is dismissed explicitly — used by the
 * loading state of `notify.promise`.
 */
function show(
  type: ToastType,
  message: string,
  overrideTimeout?: number,
): number | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const id = ++toastId;
  const detail: ToastMessage = { id, type, message };
  window.dispatchEvent(new CustomEvent(NOTIFY_SHOW_EVENT, { detail }));

  const timeout = overrideTimeout ?? 5000;
  if (timeout > 0) {
    toastTimeouts.set(
      id,
      setTimeout(() => dismissToast(id), timeout),
    );
  }

  return id;
}

export const notify = {
  success: (message: string, options?: { timeout?: number }) =>
    show("success", message, options?.timeout),
  error: (message: string, options?: { timeout?: number }) =>
    show("error", message, options?.timeout),
  info: (message: string, options?: { timeout?: number }) =>
    show("info", message, options?.timeout),

  /** Show a persistent loading toast, then replace it with the result. */
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: (data: T) => string;
      error: (err: unknown) => string;
    },
  ): Promise<number | null> => {
    const loadingId = show("info", loading, 0);

    return promise.then(
      (data) => {
        if (loadingId !== null) dismissToast(loadingId);
        return show("success", success(data));
      },
      (err: unknown) => {
        if (loadingId !== null) dismissToast(loadingId);
        return show("error", error(err));
      },
    );
  },
};
