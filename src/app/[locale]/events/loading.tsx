import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-2 h-5 w-80" />
      </div>

      {/* Timeline skeleton */}
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="mt-2 h-full w-0.5" />
            </div>
            <div className="flex-1 rounded-xl bg-surface p-4 shadow-sm">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="mt-2 h-4 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
