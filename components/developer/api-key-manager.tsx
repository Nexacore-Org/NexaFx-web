"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Dialog } from "@/components/ui/dialog";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKey,
  type CreatedApiKey,
} from "@/lib/api/api-keys";

/**
 * Key management UI for accounts whose backend exposes API-key endpoints.
 *
 * HARD RULE: the full secret is only ever present in `revealed`, which is
 * local state that is cleared when the reveal dialog closes. Nothing is
 * written to localStorage/sessionStorage and nothing is re-fetched, so a
 * key can be copied once and never shown again.
 */
export default function ApiKeyManager() {
  const queryClient = useQueryClient();
  const queryKey = ["api-keys"] as const;

  const {
    data: keys = [],
    isLoading,
    isError: isLoadError,
    error: loadError,
  } = useQuery({
    queryKey,
    queryFn: listApiKeys,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: (_, revokedId) => {
      queryClient.setQueryData<ApiKey[]>(queryKey, (prev) =>
        (prev ?? []).filter((k) => k.id !== revokedId),
      );
      setRevoking(null);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to revoke key");
    },
  });

  const closeReveal = () => {
    setRevealed(null);
    setCopied(false);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setName("");
    setError(null);
  };

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const created = await createApiKey({ name: name.trim() });
      // Show the secret once in reveal dialog; store only metadata in list cache.
      const metadata: ApiKey = {
        id: created.id,
        name: created.name,
        prefix: created.prefix,
        createdAt: created.createdAt,
        lastUsedAt: created.lastUsedAt,
        scopes: created.scopes,
      };
      queryClient.setQueryData<ApiKey[]>(queryKey, (prev) => [
        ...(prev ?? []),
        metadata,
      ]);
      setRevealed(created);
      closeCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  function onConfirmRevoke() {
    if (!revoking) return;
    setError(null);
    revokeMutation.mutate(revoking.id);
  }

  async function copySecret(secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const displayError =
    error ??
    (isLoadError
      ? loadError instanceof Error
        ? loadError.message
        : "Failed to load API keys"
      : null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
          API keys let your systems act on your behalf. Treat a key like a
          password.
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Create key
        </button>
      </div>

      {displayError && !revoking && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {displayError}
        </p>
      )}

      {isLoading ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Loading API keys…
        </p>
      ) : keys.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No API keys yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium">{key.name}</p>
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {key.prefix}…
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {key.lastUsedAt
                    ? `Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`
                    : "Never used"}
                </p>
                {key.scopes && key.scopes.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setRevoking(key);
                }}
                disabled={revokeMutation.isPending && revoking?.id === key.id}
                className="rounded border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                {revokeMutation.isPending && revoking?.id === key.id
                  ? "Revoking…"
                  : "Revoke"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Create */}
      <Dialog
        open={createOpen}
        onClose={closeCreate}
        title="Create API key"
        description="Give the key a name so you can recognise it later."
      >
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <label
              htmlFor="api-key-name"
              className="mb-1 block text-sm font-medium"
            >
              Name
            </label>
            <input
              id="api-key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={creating}
              className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeCreate}
              disabled={creating}
              className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || name.trim().length === 0}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* One-time reveal */}
      <Dialog
        open={revealed !== null}
        onClose={closeReveal}
        title="Copy your API key"
        description="This is the only time the full key is shown. Store it somewhere safe."
      >
        {revealed && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded border border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
              <code className="min-w-0 flex-1 font-mono text-xs break-all">
                {revealed.secret}
              </code>
              <button
                type="button"
                onClick={() => copySecret(revealed.secret)}
                className="shrink-0 rounded border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={copied}
                onChange={(event) => setCopied(event.target.checked)}
                className="mt-0.5"
              />
              I&apos;ve stored this key somewhere safe
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeReveal}
                className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Revoke confirmation */}
      <Dialog
        open={revoking !== null}
        onClose={() => {
          if (!revokeMutation.isPending) {
            setRevoking(null);
            setError(null);
          }
        }}
        title="Revoke this key?"
        description="Anything using this key will stop working immediately. This cannot be undone."
      >
        <div className="space-y-4">
          <p className="text-sm">
            <span className="font-medium">{revoking?.name}</span> (
            {revoking?.prefix}…)
          </p>

          {error && (
            <p
              role="alert"
              className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRevoking(null);
                setError(null);
              }}
              disabled={revokeMutation.isPending}
              className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmRevoke}
              disabled={revokeMutation.isPending}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {revokeMutation.isPending ? "Revoking…" : "Revoke"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
