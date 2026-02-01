import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPostList } from "./AdminPostList";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const [{ count: postsCount }, { count: usersCount }, { data: recentPosts }] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id, title, is_hidden, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const userIds = [...new Set((recentPosts ?? []).map((p) => p.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);
  const displayNames: Record<string, string> = {};
  (profiles ?? []).forEach((p) => {
    displayNames[p.id] = p.display_name ?? "알 수 없음";
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <Link
          href="/"
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--card-hover)]"
        >
          홈으로
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted)]">총 게시글</p>
          <p className="text-2xl font-bold">{postsCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted)]">총 사용자</p>
          <p className="text-2xl font-bold">{usersCount ?? 0}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">글 관리</h2>
        <AdminPostList
          initialPosts={recentPosts ?? []}
          displayNames={displayNames}
        />
      </section>
    </div>
  );
}
