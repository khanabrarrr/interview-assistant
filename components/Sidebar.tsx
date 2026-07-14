"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  FileText,
  Target,
  MessagesSquare,
  Sparkles,
  Map,
  StickyNote,
  User,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import NotificationBell from "@/components/NotificationBell";
import { supabase } from "@/lib/supabase";

const baseItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { href: "/job-matcher", label: "Job Matcher", icon: Target },
  { href: "/mock-interview", label: "Mock Interview", icon: MessagesSquare },
  { href: "/answer-improvement", label: "Answer Improver", icon: Sparkles },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/profile", label: "Profile", icon: User },
];

const adminItem = { href: "/admin", label: "Admin", icon: ShieldCheck };

function NavLinks({ items, pathname, onNavigate }: { items: typeof baseItems; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={clsx(
              "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-accent/10 text-accent"
                : "text-text-secondary hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(!!data?.is_admin);
    }
    checkAdmin();
  }, []);

  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  return (
    <>
      {/* Mobile top bar — visible below md, replaces the desktop sidebar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-bg-secondary px-4 py-3 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="focus-ring text-white"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="text-lg font-extrabold">
          Ace<span className="text-accent">Interview</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Mobile slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-bg-secondary p-4">
            <div className="mb-6 flex items-center justify-between px-1">
              <Link href="/" className="text-lg font-extrabold" onClick={() => setMobileOpen(false)}>
                Ace<span className="text-accent">Interview</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="focus-ring text-text-secondary hover:text-white"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="mb-6 px-1">
              <SearchBar />
            </div>
            <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — unchanged from before, hidden below md */}
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-bg-secondary p-4 md:block">
        <div className="mb-4 flex items-center justify-between px-2">
          <Link href="/" className="text-xl font-extrabold">
            Ace<span className="text-accent">Interview</span>
          </Link>
          <NotificationBell />
        </div>

        <div className="mb-6 px-1">
          <SearchBar />
        </div>

        <NavLinks items={items} pathname={pathname} />
      </aside>
    </>
  );
}
