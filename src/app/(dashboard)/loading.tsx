import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Week navigation skeleton */}
      <div className="flex items-center justify-center gap-4 py-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Day cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
