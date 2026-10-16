import type { ReactNode } from "react";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}

export function SettingsCard({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div
      className={`max-w-2xl rounded-lg border p-5 ${
        tone === "danger"
          ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <h3 className="font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {message}
    </p>
  );
}
