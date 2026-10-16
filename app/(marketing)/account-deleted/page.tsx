import Link from "next/link";

export const metadata = { title: "Account deleted · NexaFx" };

export default function AccountDeletedPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Your account has been deleted
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Your profile and saved details have been removed, and you have been
        signed out everywhere. You are welcome back whenever you are ready.
      </p>
      <Link
        href="/"
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Back to NexaFx
      </Link>
    </main>
  );
}
