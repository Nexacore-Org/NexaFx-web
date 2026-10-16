"use client";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="max-w-2xl">
      <h2 className="text-lg font-semibold">
        This section could not be loaded
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Something went wrong while loading your settings. Your account is
        unaffected.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-zinc-500">
          Reference: <code>{error.digest}</code>
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Try again
      </button>
    </div>
  );
}
