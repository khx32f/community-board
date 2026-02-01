"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function VoteButtons({ postId }: { postId: string }) {
  const router = useRouter();
  const [myVote, setMyVote] = useState<number | null>(null);
  const [counts, setCounts] = useState<{ likes: number; dislikes: number } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("post_votes")
          .select("vote_type")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .single();
        setMyVote(data?.vote_type ?? null);
      }
      const { data: votes } = await supabase
        .from("post_votes")
        .select("vote_type")
        .eq("post_id", postId);
      const likes = votes?.filter((v) => v.vote_type === 1).length ?? 0;
      const dislikes = votes?.filter((v) => v.vote_type === -1).length ?? 0;
      setCounts({ likes, dislikes });
    };
    load();
  }, [postId, supabase]);

  const vote = async (voteType: 1 | -1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirect=/posts/" + postId);
      return;
    }
    if (myVote === voteType) {
      await supabase.from("post_votes").delete().eq("post_id", postId).eq("user_id", user.id);
      setMyVote(null);
      setCounts((c) =>
        c
          ? {
              likes: voteType === 1 ? c.likes - 1 : c.likes,
              dislikes: voteType === -1 ? c.dislikes - 1 : c.dislikes,
            }
          : null
      );
    } else {
      await supabase.from("post_votes").upsert(
        { user_id: user.id, post_id: postId, vote_type: voteType },
        { onConflict: "user_id,post_id" }
      );
      const prev = myVote;
      setMyVote(voteType);
      setCounts((c) => {
        if (!c) return c;
        let likes = c.likes;
        let dislikes = c.dislikes;
        if (prev === 1) likes--;
        if (prev === -1) dislikes--;
        if (voteType === 1) likes++;
        if (voteType === -1) dislikes++;
        return { likes, dislikes };
      });
    }
    router.refresh();
  };

  if (counts === null) return <span className="text-sm text-[var(--muted)]">로딩...</span>;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => vote(1)}
          className={`rounded p-1.5 transition-colors ${
            myVote === 1 ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
          title="좋아요"
        >
          ▲
        </button>
        <span className="text-sm text-[var(--muted)]">{counts.likes}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => vote(-1)}
          className={`rounded p-1.5 transition-colors ${
            myVote === -1 ? "text-red-400" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
          title="싫어요"
        >
          ▼
        </button>
        <span className="text-sm text-[var(--muted)]">{counts.dislikes}</span>
      </div>
    </div>
  );
}
