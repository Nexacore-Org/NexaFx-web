import { Skeleton } from "@/components/ui/skeleton"

export function TermsOfServiceSkeleton() {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="w-full pl-[12%] pt-4 pb-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Title section */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Sections skeleton - mimics the structure of actual terms data */}
        {[...Array(11)].map((_, sectionIndex) => (
          <div key={sectionIndex} className="mb-6 space-y-3">
            {/* Section title */}
            <Skeleton className="h-5 w-3/4" />
            
            {/* Section content paragraphs - random number between 1-4 */}
            {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, paraIndex) => (
              <Skeleton key={paraIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}