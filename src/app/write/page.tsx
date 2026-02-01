"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ImageUploadButton } from "@/components/ImageUploadButton";

type Category = { id: string; name: string; slug: string };

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthChecked(true);
      if (!user) {
        router.replace("/login?redirect=/write");
        return;
      }
      setUserId(user.id);
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      setCategories(cats ?? []);
      if (cats?.length) setCategoryId((prev) => prev || cats[0].id);
    };
    init();
  }, [router]);

  const handleImageUploaded = (url: string) => {
    setContent((prev) => prev + (prev ? "\n\n" : "") + `![이미지](${url})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.from("posts").insert({
      user_id: user.id,
      category_id: categoryId || null,
      title: title.trim(),
      content: content.trim() || null,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  if (!authChecked) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        확인 중...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
      <h1 className="text-xl font-bold">글쓰기</h1>
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
            placeholder="제목을 입력하세요"
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
            placeholder="내용을 입력하세요. 이미지 첨부 버튼으로 사진을 추가할 수 있습니다."
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
            {loading ? "저장 중..." : "등록"}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--card-hover)]"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
