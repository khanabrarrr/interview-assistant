"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";

interface AdminUser {
  id: string;
  full_name: string;
  degree: string;
  career_goal: string;
  is_admin: boolean;
  created_at: string;
}

interface Analytics {
  totalUsers: number;
  totalResumeAnalyses: number;
  totalJobMatches: number;
  totalMockInterviews: number;
  totalNotes: number;
}

type RecordTab = "resume_analyses" | "job_matches" | "mock_interviews" | "roadmaps" | "notes";

const recordTabs: { key: RecordTab; label: string }[] = [
  { key: "resume_analyses", label: "Resume Analyses" },
  { key: "job_matches", label: "Job Matches" },
  { key: "mock_interviews", label: "Mock Interviews" },
  { key: "roadmaps", label: "Roadmaps" },
  { key: "notes", label: "Notes" },
];

// Fields shown as an editable textarea (JSON) per table, matching the
// server-side whitelist in /api/admin/records.
const EDITABLE_FIELDS: Record<RecordTab, string[]> = {
  resume_analyses: ["resume_text", "resume_score", "ats_score", "analysis"],
  job_matches: ["job_description", "match_percentage", "result"],
  mock_interviews: ["role", "interview_type", "difficulty", "transcript", "final_rating"],
  roadmaps: ["roadmap"],
  notes: ["title", "content", "pinned"],
};

function summarize(table: RecordTab, r: any): string {
  switch (table) {
    case "resume_analyses":
      return `Score: ${r.resume_score ?? "—"} · ATS: ${r.ats_score ?? "—"}`;
    case "job_matches":
      return `Match: ${r.match_percentage ?? "—"}%`;
    case "mock_interviews":
      return `${r.role || "—"} · ${r.interview_type || "—"} · Rating: ${r.final_rating ?? "—"}`;
    case "roadmaps":
      return "Placement roadmap";
    case "notes":
      return r.title;
    default:
      return "";
  }
}

function RecordsBrowser({ authHeaders }: { authHeaders: Record<string, string> }) {
  const [tab, setTab] = useState<RecordTab>("resume_analyses");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadRecords(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function loadRecords(t: RecordTab) {
    setLoading(true);
    setExpandedId(null);
    const res = await fetch(`/api/admin/records?table=${t}`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to load records.");
      setRecords([]);
    } else {
      setRecords(data.records || []);
    }
    setLoading(false);
  }

  function startEdit(record: any) {
    const fields = EDITABLE_FIELDS[tab];
    const editable = Object.fromEntries(fields.map((f) => [f, record[f]]));
    setEditValue(JSON.stringify(editable, null, 2));
    setExpandedId(record.id);
  }

  async function saveEdit(id: string) {
    let updates;
    try {
      updates = JSON.parse(editValue);
    } catch {
      toast.error("That's not valid JSON — check for a stray comma or quote.");
      return;
    }
    const res = await fetch("/api/admin/records", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ table: tab, id, updates }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to save.");
      return;
    }
    toast.success("Saved.");
    loadRecords(tab);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this submission permanently?")) return;
    const res = await fetch("/api/admin/records", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ table: tab, id }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to delete.");
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("Deleted.");
  }

  return (
    <Card className="mt-8">
      <h2 className="font-semibold">All User Submissions</h2>
      <p className="mt-1 text-xs text-text-secondary">
        View, edit, or delete anything any user has submitted.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {recordTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`focus-ring rounded-full px-4 py-1.5 text-xs font-medium transition ${
              tab === t.key ? "bg-accent text-white" : "bg-white/5 text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-text-secondary">Loading…</p>}
        {!loading && records.length === 0 && (
          <p className="text-sm text-text-secondary">No submissions in this category yet.</p>
        )}

        {!loading &&
          records.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <div key={record.id} className="rounded-lg border border-white/5 bg-bg p-3">
                <div className="flex items-start justify-between gap-4">
                  <button
                    className="focus-ring flex flex-1 items-start justify-between gap-2 text-left"
                    onClick={() => (isExpanded ? setExpandedId(null) : startEdit(record))}
                  >
                    <div>
                      <p className="text-sm font-medium">{summarize(tab, record)}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {record.owner_name} · {new Date(record.created_at).toLocaleString()}
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
                  <div className="mt-3">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={10}
                      className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary p-3 font-mono text-xs outline-none"
                    />
                    <Button onClick={() => saveEdit(record.id)} className="mt-2 flex items-center gap-2 !px-4 !py-2 text-xs">
                      <Save size={14} /> Save Changes
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </Card>
  );
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});

  async function loadAdminData() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${session.access_token}` };
    setAuthHeaders(headers);

    const [usersRes, analyticsRes] = await Promise.all([
      fetch("/api/admin/users", { headers }),
      fetch("/api/admin/analytics", { headers }),
    ]);

    if (usersRes.status === 403) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    setAuthorized(true);
    const usersData = await usersRes.json();
    const analyticsData = await analyticsRes.json();
    setUsers(usersData.users || []);
    setAnalytics(analyticsData);
    setLoading(false);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user permanently? This can't be undone.")) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to delete user.");
      return;
    }
    toast.success("User deleted.");
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="flex-1 p-10 text-sm text-text-secondary">Loading…</main>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="flex-1 p-10">
          <Card className="max-w-md">
            <h1 className="text-lg font-semibold">Not authorized</h1>
            <p className="mt-2 text-sm text-text-secondary">
              This page is restricted to admin accounts. To make your account an admin,
              set <code className="text-accent">is_admin = true</code> for your row in the{" "}
              <code className="text-accent">profiles</code> table via the Supabase dashboard.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">Admin Panel</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage users and view platform analytics.</p>

        {analytics && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card><p className="text-xs text-text-secondary">Users</p><p className="mt-1 text-2xl font-extrabold">{analytics.totalUsers}</p></Card>
            <Card><p className="text-xs text-text-secondary">Resume Analyses</p><p className="mt-1 text-2xl font-extrabold">{analytics.totalResumeAnalyses}</p></Card>
            <Card><p className="text-xs text-text-secondary">Job Matches</p><p className="mt-1 text-2xl font-extrabold">{analytics.totalJobMatches}</p></Card>
            <Card><p className="text-xs text-text-secondary">Mock Interviews</p><p className="mt-1 text-2xl font-extrabold">{analytics.totalMockInterviews}</p></Card>
            <Card><p className="text-xs text-text-secondary">Notes</p><p className="mt-1 text-2xl font-extrabold">{analytics.totalNotes}</p></Card>
          </div>
        )}

        <Card className="mt-8">
          <h2 className="font-semibold">Users</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Degree</th>
                  <th className="py-2 pr-4">Career Goal</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2 pr-4">Admin</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">{u.full_name || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{u.degree || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">{u.career_goal || "—"}</td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">{u.is_admin ? "Yes" : "No"}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="focus-ring text-text-secondary hover:text-red-400"
                        aria-label="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {Object.keys(authHeaders).length > 0 && <RecordsBrowser authHeaders={authHeaders} />}
      </main>
    </div>
  );
}
