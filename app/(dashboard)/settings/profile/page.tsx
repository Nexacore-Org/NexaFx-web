"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  SettingsCard,
  SettingsSection,
} from "../../../../components/settings/settings-section";
import { fetchProfile, updateProfile } from "../../../../lib/api/user";

export default function SettingsProfilePage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(["profile"], profile);
      setError(null);
      setSaved(true);
    },
    onError: (err: Error) => {
      setError(err.message);
      setSaved(false);
    },
  });

  // Server data seeds the form; keepDirtyValues stops a refetch overwriting edits.
  const form = useForm({
    values: {
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      phone: data?.phone ?? "",
    },
    resetOptions: { keepDirtyValues: true },
  });

  if (isPending) {
    return <p className="text-sm text-zinc-500">Loading profile…</p>;
  }

  if (isError) {
    return (
      <SettingsCard title="Profile unavailable">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We could not load your profile.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Retry
        </button>
      </SettingsCard>
    );
  }

  return (
    <SettingsSection
      title="Profile"
      description="Your name and contact details. Your email address is used for sign-in and cannot be changed here."
    >
      <form
        onSubmit={form.handleSubmit((values) => {
          setSaved(false);
          mutation.mutate(values);
        })}
      >
        <SettingsCard title="Personal details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="first-name"
              >
                First name
              </label>
              <input
                id="first-name"
                {...form.register("firstName")}
                className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                htmlFor="last-name"
              >
                Last name
              </label>
              <input
                id="last-name"
                {...form.register("lastName")}
                className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                {...form.register("phone")}
                className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                value={data?.email ?? ""}
                disabled
                readOnly
                className="w-full rounded border border-zinc-200 bg-zinc-100 px-3 py-2 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {mutation.isPending ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <span role="status" className="text-sm text-green-600">
                Saved
              </span>
            )}
          </div>
        </SettingsCard>
      </form>
    </SettingsSection>
  );
}
