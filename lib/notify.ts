let toastId = 0;

const toastTimeouts = new Map<number, NodeJS.Timeout>();

export const notify = {
  success: (message: string, options?: { timeout?: number }) => {
    show("success", message, options?.timeout);
  },
  error: (message: string, options?: { timeout?: number }) => {
    show("error", message, options?.timeout);
  },
  info: (message: string, options?: { timeout?: number }) => {
    show("info", message, options?.timeout);
  },
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
  ) => {
    notify.info(loading);
    promise
      .then((data) => {
        const toastId = Date.now();
        notify.success(success(data));
        toastTimeouts.delete(toastId);
      })
      .catch((err) => {
        const toastId = Date.now();
        notify.error(error(err));
        toastTimeouts.delete(toastId);
      });
  },
};

function show(
  type: "success" | "error" | "info",
  message: string,
  overrideTimeout?: number,
) {
  const id = ++toastId;
  const timeout = overrideTimeout || 5000;
  const isAssertive = type === "error";

  // Create toast element
  const toast = document.createElement("div");
  toast.id = `toast-${id}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", isAssertive ? "assertive" : "polite");
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    color: ${isAssertive ? "#ef4444" : "#1f2937"};
    animation: slide-in 0.3s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove
  const timer = setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    toastTimeouts.delete(id);
  }, timeout);

  toastTimeouts.set(id, timer);
}
