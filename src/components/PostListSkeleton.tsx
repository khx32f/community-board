import { Skeleton } from "./Skeleton";

export function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Skeleton className="h-8 w-32" />
      <ul className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-40" />
          </li>
        ))}
      </ul>
    </div>
  );
}
