"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-bg px-3 py-2"
    >
      <Search size={16} className="shrink-0 text-text-secondary" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes, interviews, resumes…"
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-text-secondary"
      />
    </form>
  );
}
