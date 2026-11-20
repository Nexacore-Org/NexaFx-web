export default function AdminLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className="w-full space-y-3">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />
      ))}
    </div>
  );
}
