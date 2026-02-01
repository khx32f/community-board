"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Props = {
  postId: string;
  isOwner: boolean;
  isAdmin: boolean;
  isHidden: boolean;
};

export function PostActions({ postId, isOwner, isAdmin, isHidden }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    await supabase.from("posts").delete().eq("id", postId);
    setDeleting(false);
    router.push("/");
    router.refresh();
  };

  const handleToggleHidden = async () => {
    setToggling(true);
    await supabase
      .from("posts")
      .update({ is_hidden: !isHidden, updated_at: new Date().toISOString() })
      .eq("id", postId);
    setToggling(false);
    router.refresh();
  };

  if (!isOwner && !isAdmin) return null;

  return (
    <div className="flex gap-2">
      {isOwner && (
        <Link
          href={`/posts/${postId}/edit`}
          className="rounded border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--card-hover)]"
        >
          수정
        </Link>
      )}
      {isAdmin && (
        <button
          type="button"
          onClick={handleToggleHidden}
          disabled={toggling}
          className="rounded border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--card-hover)] disabled:opacity-50"
        >
          {toggling ? "..." : isHidden ? "공개" : "숨기기"}
        </button>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded border border-red-500/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      >
        {deleting ? "삭제 중..." : "삭제"}
      </button>
    </div>
  );
}
