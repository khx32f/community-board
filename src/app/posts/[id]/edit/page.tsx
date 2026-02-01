"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ImageUploadButton } from "@/components/ImageUploadButton";

type Category = { id: string; name: string; slug: string };

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirect=/posts/" + postId + "/edit");
        return;
      }
      setUserId(user.id);
      const { data: post } = await supabase
        .from("posts")
        .select("id, title, content, category_id, user_id")
        .eq("id", postId)
        .single();
      if (!post) {
        setError("글을 찾을 수 없습니다.");
        setReady(true);
        return;
      }
      if (post.user_id !== user.id) {
        setError("수정 권한이 없습니다.");
        setReady(true);
        return;
      }
      setTitle(post.title);
      setContent(post.content ?? "");
      setCategoryId(post.category_id ?? "");
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      setCategories(cats ?? []);
      setReady(true);
    };
    load();
  }, [postId, router]);

  const handleImageUploaded = (url: string) => {
    setContent((prev) => prev + (prev ? "\n\n" : "") + `![이미지](${url})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        content: content.trim() || null,
        category_id: categoryId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/posts/" + postId);
    router.refresh();
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        로딩 중...
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-red-400">
        {error}
        <Link href="/" className="mt-4 block text-[var(--accent)] hover:underline">
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
      <h1 className="text-xl font-bold">글 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm text-[var(--muted)]">
            카테고리
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="">선택 안 함</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-[var(--muted)]">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="content" className="block text-sm text-[var(--muted)]">
              내용
            </label>
            {userId && (
              <ImageUploadButton
                userId={userId}
                onUploaded={handleImageUploaded}
                disabled={loading}
              />
            )}
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
          <Link
            href={"/posts/" + postId}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--card-hover)]"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
