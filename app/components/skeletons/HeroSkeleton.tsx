import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-12 px-4 md:px-6">
      {/* Left side content */}
      <div className="flex-1 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[80%]" /> {/* Main heading */}
          <Skeleton className="h-12 w-[60%]" /> {/* Second line of heading */}
        </div>
        <Skeleton className="h-20 w-[90%]" /> {/* Description text */}
        <div className="flex gap-4">
          <Skeleton className="h-12 w-32" /> {/* Start Trading button */}
          <Skeleton className="h-12 w-32" /> {/* Learn More button */}
        </div>
      </div>

      {/* Right side - Exchange Card */}
      <div className="flex-1 max-w-md w-full">
        <div className="bg-card rounded-lg p-6 space-y-6">
          {/* Currency Selection */}
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" /> {/* From label */}
              <Skeleton className="h-10 w-32" /> {/* Currency selector */}
              <Skeleton className="h-8 w-28" /> {/* Amount */}
            </div>
            <div className="self-center">
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Switch icon */}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" /> {/* To label */}
              <Skeleton className="h-10 w-32" /> {/* Currency selector */}
              <Skeleton className="h-8 w-28" /> {/* Amount */}
            </div>
          </div>
          
          {/* Exchange Rate */}
          <Skeleton className="h-6 w-48 mx-auto" /> {/* Exchange rate text */}
          
          {/* Exchange Button */}
          <Skeleton className="h-12 w-full" /> {/* Exchange button */}
        </div>
      </div>
    </div>
  )
}
