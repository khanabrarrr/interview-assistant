"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import { supabase } from "@/lib/supabase";

interface Activity {
  id: string;
  label: string;
  date: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [avgRelevance, setAvgRelevance] = useState<number | null>(null);
  const [practiceDays, setPracticeDays] = useState(0);
  const [interviewsCompleted, setInterviewsCompleted] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile?.full_name) {
      setFirstName(profile.full_name.trim().split(" ")[0]);
    }

    const [resumeRes, interviewsRes, matchesRes] = await Promise.all([
      supabase
        .from("resume_analyses")
        .select("resume_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("mock_interviews")
        .select("final_rating, role, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("job_matches")
        .select("match_percentage, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const resumes = resumeRes.data || [];
    const interviews = interviewsRes.data || [];
    const matches = matchesRes.data || [];

    setResumeScore(resumes[0]?.resume_score ?? null);
    setInterviewsCompleted(interviews.length);

    const rated = interviews.filter((i) => i.final_rating != null);
    setAvgRelevance(
      rated.length
        ? Math.round(rated.reduce((sum, i) => sum + (i.final_rating || 0), 0) / rated.length)
        : null
    );

    const uniqueDays = new Set(
      [...resumes, ...interviews, ...matches].map((r) => new Date(r.created_at).toDateString())
    );
    setPracticeDays(uniqueDays.size);

    const activity: Activity[] = [
      ...interviews.slice(0, 3).map((i) => ({
        id: `interview-${i.created_at}`,
        label: `Completed mock interview — ${i.role}`,
        date: i.created_at,
      })),
      ...resumes.slice(0, 3).map((r) => ({
        id: `resume-${r.created_at}`,
        label: `Analyzed resume — score ${r.resume_score}`,
        date: r.created_at,
      })),
      ...matches.slice(0, 3).map((m) => ({
        id: `match-${m.created_at}`,
        label: `Matched resume to a job — ${m.match_percentage}% match`,
        date: m.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    setRecentActivity(activity);
    setLoading(false);
  }

  const stats = [
    { label: "Resume Score", value: resumeScore != null ? `${resumeScore}` : "—", suffix: resumeScore != null ? "/100" : "" },
    { label: "Avg. Interview Relevance", value: avgRelevance != null ? `${avgRelevance}` : "—", suffix: avgRelevance != null ? "%" : "" },
    { label: "Practice Days", value: `${practiceDays}`, suffix: practiceDays === 1 ? " day" : " days" },
    { label: "Interviews Completed", value: `${interviewsCompleted}`, suffix: "" },
  ];

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Here&apos;s where your placement prep stands today.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <p className="text-sm text-text-secondary">{s.label}</p>
              <p className="mt-2 text-3xl font-extrabold">
                {loading ? "…" : s.value}
                <span className="text-base font-medium text-text-secondary">{s.suffix}</span>
              </p>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <h2 className="font-semibold">Recent Activity</h2>
          {loading ? (
            <p className="mt-4 text-sm text-text-secondary">Loading…</p>
          ) : recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">
              Nothing yet — try analyzing a resume or running a mock interview to see your
              activity here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-white/5 text-sm">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <span className="text-text-secondary">{a.label}</span>
                  <span className="text-xs text-text-secondary">
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
