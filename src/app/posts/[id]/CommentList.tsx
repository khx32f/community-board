"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
};

export function CommentList({
  postId,
  initialComments,
  displayNames,
  currentUserId,
}: {
  postId: string;
  initialComments: Comment[];
  displayNames: Record<string, string>;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as Comment;
            setComments((prev) => {
              if (prev.some((c) => c.id === newRow.id)) return prev;
              return [...prev, newRow].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Comment;
            setComments((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setComments((prev) =>
              prev.filter((c) => c.id !== deleted.id && c.parent_id !== deleted.id)
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent, parentId?: string | null) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirect=/posts/" + postId);
      return;
    }
    const text = parentId ? content.replace(/^@\S+\s*/, "").trim() : content.trim();
    if (!text) return;
    setLoading(true);
    const { data: newComment } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: text,
        parent_id: parentId || null,
      })
      .select("id, content, created_at, updated_at, user_id, parent_id")
      .single();
    setLoading(false);
    setContent("");
    setReplyingTo(null);
    if (newComment) {
      setComments((prev) =>
        [...prev, newComment].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      );
      router.refresh();
    }
  };

  const handleEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    const { error } = await supabase
      .from("comments")
      .update({
        content: editContent.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);
    if (!error) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, content: editContent.trim(), updated_at: new Date().toISOString() }
            : c
        )
      );
      setEditingId(null);
      setEditContent("");
      router.refresh();
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
      router.refresh();
    }
  };

  type CommentNode = Comment & { replies: CommentNode[] };

  const buildTree = (items: Comment[]): CommentNode[] => {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];
    items.forEach((c) => map.set(c.id, { ...c, replies: [] } as CommentNode));
    items.forEach((c) => {
      const node = map.get(c.id)!;
      if (!c.parent_id) {
        roots.push(node);
      } else {
        const parent = map.get(c.parent_id);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      }
    });
    roots.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    roots.forEach((r) =>
      r.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    );
    return roots;
  };

  const tree = buildTree(comments);

  const CommentItem = ({
    c,
    depth,
    parentName,
  }: {
    c: CommentNode;
    depth: number;
    parentName?: string;
  }) => {
    const isOwn = currentUserId === c.user_id;
    const isEditing = editingId === c.id;
    const replies = c.replies ?? [];

    return (
      <li
        key={c.id}
        className={depth > 0 ? "mt-2 border-l-2 border-[var(--border)] pl-4" : ""}
      >
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--muted)]">
                {displayNames[c.user_id]}
                {parentName && (
                  <span className="ml-1 text-[var(--accent)]">→ {parentName}</span>
                )}
                {" · "}
                {new Date(c.created_at).toLocaleString("ko-KR")}
                {c.updated_at !== c.created_at && (
                  <span className="ml-1">(수정됨)</span>
                )}
              </p>
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="rounded bg-[var(--accent)] px-2 py-1 text-xs text-white hover:bg-[var(--accent-hover)]"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setEditContent(""); }}
                      className="rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--card-hover)]"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-sm">{c.content}</p>
              )}
            </div>
            {isOwn && !isEditing && (
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(c.id);
                    setEditContent(c.content);
                  }}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-xs text-[var(--muted)] hover:text-red-400"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          {currentUserId && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setReplyingTo(c.id);
                setContent(`@${displayNames[c.user_id]} `);
              }}
              className="mt-1 text-xs text-[var(--accent)] hover:underline"
            >
              답글
            </button>
          )}
          {replyingTo === c.id && (
            <form
              onSubmit={(e) => handleSubmit(e, c.id)}
              className="mt-2 flex gap-2"
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="답글을 입력하세요"
                rows={2}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
              />
              <div className="flex flex-col gap-1">
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  등록
                </button>
                <button
                  type="button"
                  onClick={() => { setReplyingTo(null); setContent(""); }}
                  className="rounded border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--card-hover)]"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
        {replies.length > 0 && (
          <ul className="mt-2 space-y-2">
            {replies.map((r) => (
              <CommentItem
                key={r.id}
                c={r}
                depth={depth + 1}
                parentName={displayNames[c.user_id]}
              />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      {currentUserId && (
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex gap-2"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={2}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="self-end rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading ? "등록 중..." : "댓글"}
          </button>
        </form>
      )}
      {!currentUserId && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center text-sm text-[var(--muted)]">
          댓글을 작성하려면{" "}
          <Link href={"/login?redirect=/posts/" + postId} className="text-[var(--accent)] hover:underline">
            로그인
          </Link>
          해주세요.
        </p>
      )}
      <ul className="space-y-3">
        {tree.map((c) => (
          <CommentItem key={c.id} c={c} depth={0} />
        ))}
      </ul>
    </div>
  );
}
