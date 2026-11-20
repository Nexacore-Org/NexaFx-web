"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="space-y-4 rounded-lg border border-red-200 p-6">
      <h2 className="text-lg font-semibold">Something went wrong loading this admin page.</h2>
      <p className="text-sm text-muted-foreground">{error.message || "Please try again."}</p>
      <button type="button" onClick={reset} className="rounded-md border px-3 py-1.5 text-sm">
        Try again
      </button>
    </div>
  );
}
