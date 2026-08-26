import { Skeleton } from "@/components/ui/skeleton";

export function AccountOverviewSkeleton() {
  return (
    <div className="space-y-5 md:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-44" />
        </div>
        <Skeleton className="hidden md:block h-9 w-36" />
      </div>
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-sm" />
        <Skeleton className="h-20 rounded-sm" />
      </div>
    </div>
  );
}

export function TransactionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      <div className="hidden md:block">
        <div className="border-b bg-muted/30 px-6 py-4 flex gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-4">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="md:hidden space-y-4 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConvertFormSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4 bg-card rounded-2xl p-6 border border-border">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>
      <div className="space-y-4 bg-card rounded-2xl p-6 border border-border">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function DepositWalletSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-40 w-40 rounded-lg" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function SettingsProfileSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="border-b border-border pb-4 space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 flex-1 rounded-sm" />
        <Skeleton className="h-12 flex-1 rounded-sm" />
      </div>
    </div>
  );
}

export function AdminMetricCardsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex items-center gap-4 flex-1 min-w-[200px]"
          >
            <Skeleton className="h-[25px] w-[25px] rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-64 flex-1 rounded-2xl" />
        <Skeleton className="h-64 w-[43%] rounded-2xl" />
      </div>
      <AdminTableRowSkeleton rows={5} columns={5} />
    </div>
  );
}

export function AdminTableRowSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-24" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-gray-50 last:border-0 px-6 py-4 flex gap-4 items-center"
        >
          <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
          {Array.from({ length: columns - 1 }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PushNotificationListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0"
        >
          <Skeleton className="h-4 w-4 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function NotificationListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton variant="circle" className="h-9 w-9 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
