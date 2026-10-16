import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-full w-full"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading dashboard…</span>

      {/* Sidebar */}
      <div className="hidden w-56 shrink-0 flex-col gap-3 border-r border-gray-200 bg-white px-6 py-8 md:flex">
        <Skeleton width={96} height={20} />
        <div className="mt-4 space-y-3">
          <Skeleton width="100%" height={32} />
          <Skeleton width="100%" height={32} />
          <Skeleton width="100%" height={32} />
        </div>
      </div>

      {/* Topbar + content */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
          <Skeleton width={140} height={20} />
          <Skeleton width={36} height={36} />
        </div>

        <div className="flex-1 space-y-6 px-4 py-6 md:px-6">
          <Skeleton width="40%" height={24} />
          <div className="space-y-3">
            <Skeleton width="100%" height={56} />
            <Skeleton width="100%" height={56} />
            <Skeleton width="100%" height={56} />
          </div>
        </div>
      </div>
    </div>
  )
}
