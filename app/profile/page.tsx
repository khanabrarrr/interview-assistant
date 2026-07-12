"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [degree, setDegree] = useState("");
  const [skills, setSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name ?? "");
        setDegree(data.degree ?? "");
        setSkills((data.skills ?? []).join(", "));
        setCareerGoal(data.career_goal ?? "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in first.");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      degree,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      career_goal: careerGoal,
      updated_at: new Date().toISOString(),
    });
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="flex-1 p-10 text-sm text-text-secondary">Loading…</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage your account and preferences.</p>

        <Card className="mt-6 max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Email</label>
              <input
                value={email}
                disabled
                className="w-full rounded-lg border border-white/10 bg-bg-secondary/50 px-4 py-2.5 text-sm text-text-secondary outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Degree</label>
              <input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Skills (comma separated)</label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Career Goal</label>
              <input
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
