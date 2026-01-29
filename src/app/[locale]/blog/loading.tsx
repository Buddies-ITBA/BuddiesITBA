import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Blog cards grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-surface shadow-sm">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3" />
              <Skeleton className="mt-4 h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
