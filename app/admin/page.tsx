"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

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

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

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
      </main>
    </div>
  );
}
