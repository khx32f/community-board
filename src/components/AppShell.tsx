"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="pl-0 md:pl-56">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="min-h-[calc(100vh-3.5rem)] p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}
