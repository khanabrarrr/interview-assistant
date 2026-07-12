"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Placement<span className="text-accent">AI</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-text-secondary transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="focus-ring rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black transition hover:bg-accent-dark"
          >
            Get Started
          </Link>
        </div>

        <button
          className="focus-ring text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-4 border-t border-white/5 px-6 py-4 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-text-secondary">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="text-sm font-semibold">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-accent px-5 py-2 text-center text-sm font-semibold text-black"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
