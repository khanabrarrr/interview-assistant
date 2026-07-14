"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import { supabase } from "@/lib/supabase";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Tab = "resumes" | "matches" | "interviews" | "roadmaps" | "notes";

const tabs: { key: Tab; label: string; table: string }[] = [
  { key: "resumes", label: "Resume Analyses", table: "resume_analyses" },
  { key: "matches", label: "Job Matches", table: "job_matches" },
  { key: "interviews", label: "Mock Interviews", table: "mock_interviews" },
  { key: "roadmaps", label: "Roadmaps", table: "roadmaps" },
  { key: "notes", label: "Notes", table: "notes" },
];

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("resumes");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadRecords(activeTab);
  }, [activeTab]);

  async function loadRecords(tab: Tab) {
    setLoading(true);
    setExpandedId(null);
    const table = tabs.find((t) => t.key === tab)!.table;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRecords(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry permanently?")) return;
    const table = tabs.find((t) => t.key === activeTab)!.table;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("Deleted.");
  }

  function summarize(record: any): string {
    switch (activeTab) {
      case "resumes":
        return `Resume score: ${record.resume_score ?? "—"} · ATS: ${record.ats_score ?? "—"}`;
      case "matches":
        return `Match: ${record.match_percentage ?? "—"}%`;
      case "interviews":
        return `${record.role || "Role not set"} · ${record.interview_type || "—"} · Rating: ${record.final_rating ?? "—"}`;
      case "roadmaps":
        return "Placement roadmap";
      case "notes":
        return record.title;
      default:
        return "";
    }
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">History</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Everything you&apos;ve generated and saved, in one place.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`focus-ring rounded-full px-4 py-1.5 text-xs font-medium transition ${
                activeTab === t.key ? "bg-accent text-white" : "bg-white/5 text-text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {loading && <p className="text-sm text-text-secondary">Loading…</p>}

          {!loading && records.length === 0 && (
            <p className="text-sm text-text-secondary">
              Nothing here yet — this fills up as you use the tools.
            </p>
          )}

          {!loading &&
            records.map((record) => {
              const isExpanded = expandedId === record.id;
              return (
                <Card key={record.id}>
                  <div className="flex items-start justify-between gap-4">
                    <button
                      className="focus-ring flex flex-1 items-start justify-between gap-2 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    >
                      <div>
                        <p className="text-sm font-medium">{summarize(record)}</p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="mt-1 shrink-0 text-text-secondary" />
                      ) : (
                        <ChevronDown size={16} className="mt-1 shrink-0 text-text-secondary" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="focus-ring shrink-0 text-text-secondary hover:text-red-400"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {isExpanded && (
                    <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-bg p-3 text-xs text-text-secondary">
                      {JSON.stringify(record, null, 2)}
                    </pre>
                  )}
                </Card>
              );
            })}
        </div>
      </main>
    </div>
  );
}
