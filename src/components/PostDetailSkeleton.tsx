import { Skeleton } from "./Skeleton";

export function PostDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-full" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
        </div>
      </article>
      <section>
        <Skeleton className="mb-3 h-6 w-24" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
