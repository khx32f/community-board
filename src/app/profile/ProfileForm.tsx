"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const AVATAR_SIZE = 96;
const MAX_AVATAR_SIZE = 1048576; // 1MB

export function ProfileForm({
  userId,
  initialDisplayName,
  initialAvatarUrl,
}: {
  userId: string;
  initialDisplayName: string;
  initialAvatarUrl: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setMessage("이미지는 1MB 이하여야 합니다.");
      return;
    }
    setUploading(true);
    setMessage(null);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (uploadErr) {
      setMessage(uploadErr.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    setAvatarUrl(publicUrl);
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (!updateErr) {
      setMessage("아바타가 저장되었습니다.");
      router.refresh();
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("저장되었습니다.");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div
            className="overflow-hidden rounded-full border-2 border-[var(--border)] bg-[var(--card-hover)]"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="아바타"
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                className="object-cover"
                unoptimized
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-3xl text-[var(--muted)]"
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              >
                ?
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2 w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--card-hover)] disabled:opacity-50"
          >
            {uploading ? "업로드 중..." : "이미지 변경"}
          </button>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <label htmlFor="displayName" className="mb-1 block text-sm text-[var(--muted)]">
              표시 이름
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted)]">
              아바타 URL (직접 입력)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... 또는 이미지 변경 버튼 사용"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
      </div>
      {message && (
        <p className={`text-sm ${message.includes("저장") || message.includes("아바타") ? "text-green-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {loading ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
