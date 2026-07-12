"use client";

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
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { href: "/job-matcher", label: "Job Matcher", icon: Target },
  { href: "/mock-interview", label: "Mock Interview", icon: MessagesSquare },
  { href: "/answer-improvement", label: "Answer Improver", icon: Sparkles },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-bg-secondary p-4 md:block">
      <Link href="/" className="mb-8 block px-2 text-xl font-extrabold">
        Placement<span className="text-accent">AI</span>
      </Link>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
