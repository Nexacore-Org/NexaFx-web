"use client";

/**
 * Honest placeholder for routes whose backend is not ready.
 *
 * The API-key page renders this (rather than a mock key table) because the
 * backend exposes no key endpoints yet — showing fake keys would be worse
 * than saying so. See `lib/api/api-keys.ts` for the intended contract.
 */
export default function DeveloperComingSoon() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          Coming soon
        </p>
        <h3 className="mt-3 font-medium">API keys are not available yet</h3>
        <p className="mt-1 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
          Programmatic access is on the roadmap, but the backend does not expose
          key management endpoints yet, so there is nothing here to create or
          revoke. No placeholder keys are shown.
        </p>
        <p className="mt-3 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
          When it ships you&apos;ll be able to create, view the prefix of and
          revoke keys here, with a full key shown exactly once at creation time.
        </p>
      </div>
    </div>
  );
}
