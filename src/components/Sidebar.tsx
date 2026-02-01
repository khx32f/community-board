"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
    >
      로그아웃
    </button>
  );
}

const navItems = [
  { href: "/", label: "홈" },
  { href: "/search", label: "검색" },
];

type SidebarProps = {
  isMobileOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    };
    init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u ?? null);
      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", u.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const NavContent = () => (
    <>
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 px-3 py-2 text-lg font-bold"
        onClick={onClose}
      >
        <span className="text-[var(--accent)]">커뮤니티</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === href
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="my-2 border-t border-[var(--border)]" />
        {user ? (
          <>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === "/admin"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                관리자
              </Link>
            )}
            <Link
              href="/profile"
              onClick={onClose}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === "/profile"
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              내 정보
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 border-r border-[var(--border)] bg-[var(--card)] md:block">
        <div className="flex h-full flex-col p-3">
          <NavContent />
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 모바일 드로어 */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 max-w-[85vw] border-r border-[var(--border)] bg-[var(--card)] transform transition-transform duration-200 ease-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-[var(--accent)]">메뉴</span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              aria-label="메뉴 닫기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <NavContent />
        </div>
      </aside>
    </>
  );
}
