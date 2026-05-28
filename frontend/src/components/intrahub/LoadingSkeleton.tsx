import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "stat";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = "card", count = 1, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "stat") {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {items.map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="mt-4 h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
