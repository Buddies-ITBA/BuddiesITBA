import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="bg-gradient-to-b from-sky to-background">
        <div className="container-page pb-14 pt-10">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-6 h-12 w-2/3 max-w-md" />
          <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        </div>
      </div>
      <div className="container-page grid gap-6 py-12 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
