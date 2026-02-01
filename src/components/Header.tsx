"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

type HeaderProps = {
  onMenuClick?: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 md:gap-4 border-b border-[var(--border)] bg-[var(--background)] px-4 md:px-6">
      <button
        type="button"
        onClick={() => onMenuClick?.()}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
        aria-label="메뉴 열기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
      <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-xl">
        <input
          type="search"
          placeholder="검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </form>
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <ThemeToggle />
        <Link
          href="/write"
          className="rounded-lg bg-[var(--accent)] px-3 py-2 md:px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          글쓰기
        </Link>
      </div>
    </header>
  );
}
