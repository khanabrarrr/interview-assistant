"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";

interface Improved {
  betterAnswer: string;
  shortVersion: string;
  starVersion: string;
  professionalVersion: string;
  grammarCorrections: string[];
  strongerVocabulary: string[];
  missingPoints: string[];
}

export default function AnswerImprovementPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [improved, setImproved] = useState<Improved | null>(null);

  async function handleImprove() {
    if (!answer.trim()) {
      toast.error("Type an answer to improve.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/answer/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Improvement failed");
      setImproved(data.improved);
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
        <h1 className="text-2xl font-extrabold">AI Answer Improvement</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Turn a rough answer into a polished, structured response.
        </p>

        <Card className="mt-6 max-w-2xl">
          <label className="mb-1 block text-sm text-text-secondary">Interview Question (optional)</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="focus-ring mb-4 w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
            placeholder="e.g. Tell me about a time you handled conflict in a team"
          />
          <label className="mb-1 block text-sm text-text-secondary">Your Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary p-3 text-sm outline-none"
          />
          <Button onClick={handleImprove} disabled={loading} className="mt-4">
            {loading ? "Improving…" : "Improve My Answer"}
          </Button>
        </Card>

        {improved && (
          <div className="mt-8 grid max-w-2xl grid-cols-1 gap-6">
            <Card>
              <h3 className="font-semibold text-accent">Better Answer</h3>
              <p className="mt-2 text-sm text-text-secondary">{improved.betterAnswer}</p>
            </Card>
            <Card>
              <h3 className="font-semibold">STAR Method Version</h3>
              <p className="mt-2 text-sm text-text-secondary">{improved.starVersion}</p>
            </Card>
            <Card>
              <h3 className="font-semibold">Short Version</h3>
              <p className="mt-2 text-sm text-text-secondary">{improved.shortVersion}</p>
            </Card>
            <Card>
              <h3 className="font-semibold">Professional Version</h3>
              <p className="mt-2 text-sm text-text-secondary">{improved.professionalVersion}</p>
            </Card>
            <Card>
              <h3 className="font-semibold">Missing Points</h3>
              <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                {improved.missingPoints?.map((p) => <li key={p}>• {p}</li>)}
              </ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
