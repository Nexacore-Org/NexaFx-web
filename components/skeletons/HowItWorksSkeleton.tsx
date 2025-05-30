import { Skeleton } from "../ui/skeleton";

export function HowItWorksSkeleton() {
  return (
    <section className="py-16 px-4 md:px-6">
      <div className="text-center mb-12 space-y-4">
        <Skeleton className="h-6 w-24 mx-auto" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-6 w-[80%] max-w-2xl mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-card p-6 rounded-lg space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            {/* Title */}
            <div className="text-center">
              <Skeleton className="h-6 w-40 mx-auto" />
            </div>

            <div className="text-center">
              <Skeleton className="h-4 w-[90%] mx-auto" />
              <Skeleton className="h-4 w-[75%] mx-auto mt-2" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="mt-4 h-12 w-32 mx-auto" />
    </section>
  );
}
