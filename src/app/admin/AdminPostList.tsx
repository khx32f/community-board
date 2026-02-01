"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  is_hidden: boolean;
  created_at: string;
  user_id: string;
};

type Props = {
  initialPosts: Post[];
  displayNames: Record<string, string>;
};

export function AdminPostList({ initialPosts, displayNames }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleToggleHidden = async (post: Post) => {
    setLoading(post.id);
    await supabase
      .from("posts")
      .update({ is_hidden: !post.is_hidden, updated_at: new Date().toISOString() })
      .eq("id", post.id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, is_hidden: !p.is_hidden } : p
      )
    );
    setLoading(null);
    router.refresh();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    setLoading(postId);
    await supabase.from("posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setLoading(null);
    router.refresh();
  };

  if (!posts.length) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        글이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--card-hover)]">
            <th className="px-4 py-3 text-left font-medium">제목</th>
            <th className="px-4 py-3 text-left font-medium">작성자</th>
            <th className="px-4 py-3 text-left font-medium">날짜</th>
            <th className="px-4 py-3 text-left font-medium">상태</th>
            <th className="px-4 py-3 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className={`border-b border-[var(--border)] ${post.is_hidden ? "opacity-60" : ""}`}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/posts/${post.id}`}
                  className="font-medium hover:text-[var(--accent)]"
                >
                  {post.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {displayNames[post.user_id] ?? "알 수 없음"}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </td>
              <td className="px-4 py-3">
                {post.is_hidden ? (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                    숨김
                  </span>
                ) : (
                  <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                    공개
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleHidden(post)}
                    disabled={loading === post.id}
                    className="rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--card-hover)] disabled:opacity-50"
                  >
                    {post.is_hidden ? "공개" : "숨기기"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    disabled={loading === post.id}
                    className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
