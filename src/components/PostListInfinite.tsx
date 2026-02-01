"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 20;

type Post = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  user_id: string;
  category_id: string | null;
};

type Props = {
  initialPosts: Post[];
  initialDisplayNames: Record<string, string>;
  initialCategoryMap: Record<string, { name: string; slug: string }>;
  categorySlug?: string;
  categoryId: string | null;
};

function plainText(content: string | null): string {
  if (!content) return "";
  return content.replace(/!\[.*?\]\(.*?\)/g, "[이미지]").slice(0, 150);
}

export function PostListInfinite({
  initialPosts,
  initialDisplayNames,
  initialCategoryMap,
  categorySlug,
  categoryId,
}: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [displayNames, setDisplayNames] = useState(initialDisplayNames);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const offset = posts.length;
    let query = supabase
      .from("posts")
      .select("id, title, content, created_at, user_id, category_id")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    const { data: newPosts } = await query;
    setLoading(false);
    if (!newPosts?.length || newPosts.length < PAGE_SIZE) {
      setHasMore(false);
    }
    if (newPosts?.length) {
      const newIds = [...new Set(newPosts.map((p) => p.user_id))];
      if (newIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", newIds);
        const newNames: Record<string, string> = {};
        (profiles ?? []).forEach((p) => {
          newNames[p.id] = p.display_name ?? "알 수 없음";
        });
        setDisplayNames((prev) => ({ ...prev, ...newNames }));
      }
      setPosts((prev) => [...prev, ...newPosts]);
    }
  }, [loading, hasMore, posts.length, categoryId]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (!posts.length) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        {categoryId
          ? "이 카테고리에 아직 글이 없습니다."
          : "아직 글이 없습니다."}{" "}
        <Link href="/write" className="text-[var(--accent)] hover:underline">
          첫 글을 작성해 보세요.
        </Link>
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/posts/${post.id}`}
              className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--card-hover)]"
            >
              {post.category_id && initialCategoryMap[post.category_id] && (
                <span className="mb-1 inline-block rounded bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {initialCategoryMap[post.category_id].name}
                </span>
              )}
              <h2 className="font-semibold">{post.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                {plainText(post.content)}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {displayNames[post.user_id] ?? "알 수 없음"} ·{" "}
                {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} className="py-4">
        {loading && (
          <p className="text-center text-sm text-[var(--muted)]">불러오는 중...</p>
        )}
      </div>
    </>
  );
}
