import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  type PostRow = { id: string; title: string; content: string | null; created_at: string; user_id: string; category_id: string | null };
  let posts: PostRow[] = [];
  let displayNames: Record<string, string> = {};
  let categoryMap: Record<string, string> = {};

  if (q?.trim()) {
    const raw = q.trim().slice(0, 200);
    const escaped = raw
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/%/g, "\\%")
      .replace(/'/g, "''");
    const term = `%${escaped}%`;
    const { data } = await supabase
      .from("posts")
      .select("id, title, content, created_at, user_id, category_id")
      .or(`title.ilike."${term}",content.ilike."${term}"`)
      .order("created_at", { ascending: false })
      .limit(50);
    posts = data ?? [];
    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const categoryIds = [...new Set(posts.map((p) => p.category_id).filter(Boolean))] as string[];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);
      (profiles ?? []).forEach((p) => {
        displayNames[p.id] = p.display_name ?? "알 수 없음";
      });
    }
    if (categoryIds.length > 0) {
      const { data: cats } = await supabase.from("categories").select("id, name").in("id", categoryIds);
      (cats ?? []).forEach((c) => { categoryMap[c.id] = c.name; });
    }
  }

  function plainText(content: string | null): string {
    if (!content) return "";
    return content.replace(/!\[.*?\]\(.*?\)/g, "[이미지]").slice(0, 150);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">글 검색</h1>
      {!q?.trim() ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          검색어를 입력하세요. (상단 검색창 또는 URL: /search?q=검색어)
        </p>
      ) : !posts.length ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          &quot;{q}&quot;에 대한 검색 결과가 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--card-hover)]"
              >
                {post.category_id && categoryMap[post.category_id] && (
                  <span className="mb-1 inline-block rounded bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
                    {categoryMap[post.category_id]}
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
      )}
    </div>
  );
}
