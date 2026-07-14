"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import { supabase } from "@/lib/supabase";
import { StickyNote, FileText, MessagesSquare, ListChecks, Map, Target } from "lucide-react";

interface ResultGroup {
  label: string;
  icon: any;
  items: { id: string; title: string; snippet: string; href: string }[];
}

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [groups, setGroups] = useState<ResultGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function runSearch(query: string) {
    setLoading(true);
    const like = `%${query}%`;

    const [notesRes, questionsRes, resumesRes, matchesRes, interviewsRes, roadmapsRes] =
      await Promise.all([
        supabase
          .from("notes")
          .select("id, title, content")
          .or(`title.ilike.${like},content.ilike.${like}`)
          .limit(10),
        supabase.from("saved_questions").select("id, question, category").ilike("question", like).limit(10),
        // Search the actual resume text, not just return the latest ones unfiltered.
        supabase
          .from("resume_analyses")
          .select("id, resume_score, resume_text, created_at")
          .ilike("resume_text", like)
          .limit(10),
        supabase
          .from("job_matches")
          .select("id, job_description, match_percentage, created_at")
          .ilike("job_description", like)
          .limit(10),
        supabase
          .from("mock_interviews")
          .select("id, role, interview_type, created_at")
          .ilike("role", like)
          .limit(10),
        supabase.from("roadmaps").select("id, roadmap, created_at").limit(10),
      ]);

    const results: ResultGroup[] = [
      {
        label: "Notes",
        icon: StickyNote,
        items: (notesRes.data || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          snippet: (n.content || "").slice(0, 100),
          href: "/notes",
        })),
      },
      {
        label: "Saved Questions",
        icon: ListChecks,
        items: (questionsRes.data || []).map((qq: any) => ({
          id: qq.id,
          title: qq.question,
          snippet: qq.category || "",
          href: "/mock-interview",
        })),
      },
      {
        label: "Resume Analyses",
        icon: FileText,
        items: (resumesRes.data || []).map((r: any) => ({
          id: r.id,
          title: `Resume score: ${r.resume_score ?? "—"}`,
          snippet: new Date(r.created_at).toLocaleDateString(),
          href: "/history",
        })),
      },
      {
        label: "Job Matches",
        icon: Target,
        items: (matchesRes.data || []).map((m: any) => ({
          id: m.id,
          title: `Match: ${m.match_percentage ?? "—"}%`,
          snippet: new Date(m.created_at).toLocaleDateString(),
          href: "/history",
        })),
      },
      {
        label: "Mock Interviews",
        icon: MessagesSquare,
        items: (interviewsRes.data || []).map((m: any) => ({
          id: m.id,
          title: `${m.role} — ${m.interview_type}`,
          snippet: new Date(m.created_at).toLocaleDateString(),
          href: "/history",
        })),
      },
      {
        label: "Roadmaps",
        icon: Map,
        items: (roadmapsRes.data || []).map((r: any) => ({
          id: r.id,
          title: "Placement roadmap",
          snippet: new Date(r.created_at).toLocaleDateString(),
          href: "/history",
        })),
      },
    ];

    setGroups(results);
    setLoading(false);
  }

  const totalResults = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">Search results for &ldquo;{q}&rdquo;</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {loading ? "Searching…" : `${totalResults} result${totalResults === 1 ? "" : "s"} found`}
        </p>

        <div className="mt-8 space-y-8">
          {groups.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.label}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-accent">
                    <group.icon size={16} />
                    {group.label}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <Link key={item.id} href={item.href}>
                        <Card className="transition hover:border-accent/30">
                          <p className="text-sm font-medium">{item.title}</p>
                          {item.snippet && (
                            <p className="mt-1 text-xs text-text-secondary">{item.snippet}</p>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
          )}

          {!loading && totalResults === 0 && q.trim() && (
            <p className="text-sm text-text-secondary">
              No results found. Try a different search term.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
