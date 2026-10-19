"use client";

import DeveloperComingSoon from "@/components/developer/developer-coming-soon";
import ApiKeyManager from "@/components/developer/api-key-manager";
import { API_DOCS_URL, DEVELOPER_ENABLED } from "@/lib/api/api-keys";

/**
 * Developer settings: API key management.
 *
 * The backend does not expose API-key endpoints yet, so this page renders an
 * honest "Coming Soon" state instead of fake keys (see `lib/api/api-keys.ts`).
 * The whole route is gated behind the `NEXT_PUBLIC_DEVELOPER_ENABLED` flag;
 * when the backend ships, flipping the flag swaps in `ApiKeyManager`.
 */
export default function DeveloperPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Developer
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage programmatic access to your NexaFx account.
        </p>
      </header>

      {DEVELOPER_ENABLED ? <ApiKeyManager /> : <DeveloperComingSoon />}

      {API_DOCS_URL && (
        <p className="text-sm">
          <a
            href={API_DOCS_URL}
            className="font-medium text-blue-700 underline dark:text-blue-400"
            rel="noreferrer noopener"
            target="_blank"
          >
            API documentation
          </a>
        </p>
      )}
    </div>
  );
}
