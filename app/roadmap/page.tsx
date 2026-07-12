"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";

interface Roadmap {
  dailyTasks: string[];
  weeklyGoals: string[];
  resources: string[];
  revisionPlan: string[];
  practiceChecklist: string[];
}

export default function RoadmapPage() {
  const [degree, setDegree] = useState("");
  const [skills, setSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [weakAreas, setWeakAreas] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  // This calls the same Gemini-backed pattern as the other tools. Add a
  // dedicated /api/roadmap/generate route (mirroring /api/job/match) that
  // prompts the model with these fields and returns the Roadmap shape below.
  async function handleGenerate() {
    if (!careerGoal.trim()) {
      toast.error("Tell us your career goal first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ degree, skills, careerGoal, weakAreas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Roadmap generation failed");
      setRoadmap(data.roadmap);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">Placement Preparation Roadmap</h1>
        <p className="mt-1 text-sm text-text-secondary">
          A personalized plan built from your background and goals.
        </p>

        <Card className="mt-6 max-w-xl space-y-4">
          <input
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            placeholder="Degree (e.g. B.Tech CSE)"
            className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Skills (comma separated)"
            className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="Career goal (e.g. SDE at a product company)"
            className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
          />
          <input
            value={weakAreas}
            onChange={(e) => setWeakAreas(e.target.value)}
            placeholder="Weak areas (comma separated)"
            className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
          />
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : "Generate Roadmap"}
          </Button>
        </Card>

        {roadmap && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="font-semibold text-accent">Daily Tasks</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {roadmap.dailyTasks?.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </Card>
            <Card>
              <h3 className="font-semibold">Weekly Goals</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {roadmap.weeklyGoals?.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </Card>
            <Card>
              <h3 className="font-semibold">Resources</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {roadmap.resources?.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </Card>
            <Card>
              <h3 className="font-semibold">Revision Plan</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {roadmap.revisionPlan?.map((t) => <li key={t}>• {t}</li>)}
              </ul>
            </Card>
            <Card className="lg:col-span-2">
              <h3 className="font-semibold">Practice Checklist</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {roadmap.practiceChecklist?.map((t) => <li key={t}>☐ {t}</li>)}
              </ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
