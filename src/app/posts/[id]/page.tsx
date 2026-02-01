import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostActions } from "./PostActions";
import { CommentList } from "./CommentList";
import { VoteButtons } from "./VoteButtons";
import { ContentRenderer } from "@/components/ContentRenderer";
import Image from "next/image";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content, created_at, updated_at, user_id, category_id, is_hidden")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", post.user_id)
    .single();

  const { data: category } = post.category_id
    ? await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("id", post.category_id)
        .single()
    : { data: null };

  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at, updated_at, user_id, parent_id")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const userIds = [...new Set([post.user_id, ...(comments ?? []).map((c) => c.user_id)])];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);
  const displayNames: Record<string, string> = {};
  const avatarUrls: Record<string, string> = {};
  (profiles ?? []).forEach((p) => {
    displayNames[p.id] = p.display_name ?? "알 수 없음";
    if (p.avatar_url) avatarUrls[p.id] = p.avatar_url;
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentProfile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = currentProfile?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {avatarUrls[post.user_id] ? (
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={avatarUrls[post.user_id]}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--border)] text-xs text-[var(--muted)]">
                ?
              </div>
            )}
            <div>
              <p className="text-sm text-[var(--foreground)]">
                {displayNames[post.user_id]}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {new Date(post.created_at).toLocaleString("ko-KR")}
                {post.updated_at !== post.created_at && " (수정됨)"}
              </p>
            </div>
          </div>
          {(user?.id === post.user_id || isAdmin) && (
            <PostActions
              postId={post.id}
              isOwner={user?.id === post.user_id}
              isAdmin={isAdmin}
              isHidden={post.is_hidden ?? false}
            />
          )}
        </div>
        {category && (
          <Link
            href={`/?category=${encodeURIComponent(category.slug)}`}
            className="mb-2 inline-block rounded bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)] hover:bg-[var(--card-hover)]"
          >
            {category.name}
          </Link>
        )}
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="mt-4 text-[var(--foreground)]">
          <ContentRenderer content={post.content || ""} />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <VoteButtons postId={post.id} />
        </div>
      </article>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          댓글 {comments?.length ?? 0}
        </h2>
        <CommentList
          postId={id}
          initialComments={comments ?? []}
          displayNames={displayNames}
          currentUserId={user?.id ?? null}
        />
      </section>
    </div>
  );
}
