"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 5242880; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

type Props = {
  userId: string;
  onUploaded: (url: string) => void;
  disabled?: boolean;
};

export function ImageUploadButton({ userId, onUploaded, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("JPEG, PNG, GIF, WebP만 가능합니다.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("이미지는 5MB 이하여야 합니다.");
      return;
    }
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("post-images")
      .upload(path, file, { upsert: false });
    setUploading(false);
    e.target.value = "";
    if (uploadErr) {
      setError(uploadErr.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("post-images")
      .getPublicUrl(path);
    onUploaded(publicUrl);
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] disabled:opacity-50"
      >
        {uploading ? "업로드 중..." : "이미지 첨부"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
