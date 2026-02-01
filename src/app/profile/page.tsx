import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single();

  const { data: myPosts } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">내 정보</h1>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">프로필</h2>
        <ProfileForm
          userId={user.id}
          initialDisplayName={profile?.display_name ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? ""}
        />
        <p className="mt-4 text-sm text-[var(--muted)]">
          이메일: {user.email}
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-4 text-lg font-semibold">내가 쓴 글</h2>
        {!myPosts?.length ? (
          <p className="text-sm text-[var(--muted)]">아직 작성한 글이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {myPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="block rounded py-1 text-sm hover:text-[var(--accent)]"
                >
                  {post.title}
                </Link>
                <span className="text-xs text-[var(--muted)]">
                  {" "}
                  · {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
