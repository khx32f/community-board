"use client";

import Link from "next/link";

type Category = { id: string; name: string; slug: string };

export function CategoryFilter({
  categories,
  currentSlug,
}: {
  categories: Category[];
  currentSlug?: string;
}) {
  if (!categories.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`rounded-full px-3 py-1 text-sm transition-colors ${
          !currentSlug
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
        }`}
      >
        전체
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/?category=${encodeURIComponent(c.slug)}`}
          className={`rounded-full px-3 py-1 text-sm transition-colors ${
            currentSlug === c.slug
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
