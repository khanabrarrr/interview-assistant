"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";

interface MatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  atsCompatibility: number;
  suggestedResumeChanges: string[];
  importantKeywords: string[];
  skillsToLearn: string[];
}

export default function JobMatcherPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  async function handleMatch() {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error("Paste both your resume and the job description.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/job/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Matching failed");
      setResult(data.match);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("job_matches").insert({
          user_id: user.id,
          job_description: jobDescription.slice(0, 4000),
          match_percentage: data.match.matchPercentage,
          result: data.match,
        });
      }
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
        <h1 className="text-2xl font-extrabold">Job Description Matcher</h1>
        <p className="mt-1 text-sm text-text-secondary">
          See exactly how your resume stacks up against a role.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <label className="mb-2 block text-sm font-medium">Your Resume</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={10}
              placeholder="Paste your resume text…"
              className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary p-3 text-sm outline-none"
            />
          </Card>
          <Card>
            <label className="mb-2 block text-sm font-medium">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the job description…"
              className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary p-3 text-sm outline-none"
            />
          </Card>
        </div>

        <Button onClick={handleMatch} disabled={loading} className="mt-4">
          {loading ? "Matching…" : "Match Resume to Job"}
        </Button>

        {result && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <div className="flex gap-10">
                <div>
                  <p className="text-sm text-text-secondary">Match Percentage</p>
                  <p className="text-4xl font-extrabold text-accent">{result.matchPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">ATS Compatibility</p>
                  <p className="text-4xl font-extrabold text-accent">{result.atsCompatibility}%</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-accent">Matching Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.matchingSkills?.map((s) => (
                  <span key={s} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">{s}</span>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-red-400">Missing Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.missingSkills?.map((s) => (
                  <span key={s} className="rounded-full bg-white/5 px-3 py-1 text-xs text-text-secondary">{s}</span>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold">Suggested Resume Changes</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {result.suggestedResumeChanges?.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </Card>

            <Card>
              <h3 className="font-semibold">Skills to Learn</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {result.skillsToLearn?.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
