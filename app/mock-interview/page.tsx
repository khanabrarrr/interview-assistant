"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";

interface QA {
  question: string;
  answer: string;
  feedback?: {
    evaluation: string;
    idealAnswer: string;
    betterWording: string;
    confidenceScore: number;
    relevanceScore: number;
  };
}

const interviewTypes = ["HR", "Technical", "Behavioral", "Project Based", "Placement Interview"];
const difficulties = ["Easy", "Medium", "Hard"];

export default function MockInterviewPage() {
  const [started, setStarted] = useState(false);
  const [role, setRole] = useState("Frontend Developer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewType, setInterviewType] = useState("Technical");

  const [history, setHistory] = useState<QA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  async function callChat(lastAnswer?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          experienceLevel,
          difficulty,
          interviewType,
          history: history.map(({ question, answer }) => ({ question, answer })),
          lastAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Interview step failed");

      if (data.feedback && lastAnswer) {
        setHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].feedback = data.feedback;
          return updated;
        });
      }

      if (data.isFinalQuestion === true && !data.nextQuestion) {
        setFinished(true);
      } else {
        setCurrentQuestion(data.nextQuestion);
        if (data.isFinalQuestion) setFinished(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Once the interview is marked finished, persist the transcript and an
  // average score so it shows up in the dashboard and recent activity.
  useEffect(() => {
    if (!finished || history.length === 0) return;

    async function saveInterview() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const scored = history.filter((h) => h.feedback);
      const avgRelevance = scored.length
        ? Math.round(
            scored.reduce((sum, h) => sum + (h.feedback?.relevanceScore || 0), 0) / scored.length
          )
        : null;

      await supabase.from("mock_interviews").insert({
        user_id: user.id,
        role,
        interview_type: interviewType,
        difficulty,
        transcript: history,
        final_rating: avgRelevance,
      });
    }

    saveInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  function handleStart() {
    setStarted(true);
    setHistory([]);
    setFinished(false);
    callChat();
  }

  function handleSubmitAnswer() {
    if (!answer.trim()) {
      toast.error("Type an answer first.");
      return;
    }
    setHistory((prev) => [...prev, { question: currentQuestion, answer }]);
    const submitted = answer;
    setAnswer("");
    callChat(submitted);
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-extrabold">AI Mock Interview</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Practice one question at a time and get instant, specific feedback.
        </p>

        {!started ? (
          <Card className="mt-6 max-w-xl">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Target Role</label>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Experience Level</label>
                <input
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="focus-ring w-full rounded-lg border border-white/10 bg-bg-secondary px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Interview Type</label>
                <div className="flex flex-wrap gap-2">
                  {interviewTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setInterviewType(t)}
                      className={`focus-ring rounded-full px-4 py-1.5 text-xs font-medium transition ${
                        interviewType === t ? "bg-accent text-white" : "bg-white/5 text-text-secondary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Difficulty</label>
                <div className="flex gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`focus-ring rounded-full px-4 py-1.5 text-xs font-medium transition ${
                        difficulty === d ? "bg-accent text-white" : "bg-white/5 text-text-secondary"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleStart} className="w-full">
                Start Interview
              </Button>
            </div>
          </Card>
        ) : (
          <div className="mt-6 max-w-2xl space-y-6">
            {history.map((qa, i) => (
              <Card key={i}>
                <p className="text-sm font-semibold text-accent">Q{i + 1}. {qa.question}</p>
                <p className="mt-3 text-sm text-text-secondary">Your answer: {qa.answer}</p>
                {qa.feedback && (
                  <div className="mt-4 space-y-2 border-t border-white/5 pt-4 text-sm">
                    <p><span className="text-text-secondary">Evaluation: </span>{qa.feedback.evaluation}</p>
                    <p><span className="text-text-secondary">Ideal answer: </span>{qa.feedback.idealAnswer}</p>
                    <p><span className="text-text-secondary">Better wording: </span>{qa.feedback.betterWording}</p>
                    <div className="flex gap-6 pt-1">
                      <span>Confidence: <b className="text-accent">{qa.feedback.confidenceScore}</b></span>
                      <span>Relevance: <b className="text-accent">{qa.feedback.relevanceScore}</b></span>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {!finished && currentQuestion && (
              <Card>
                <p className="text-sm font-semibold text-accent">
                  Q{history.length + 1}. {currentQuestion}
                </p>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="Type your answer…"
                  className="focus-ring mt-4 w-full rounded-lg border border-white/10 bg-bg-secondary p-3 text-sm outline-none"
                />
                <Button onClick={handleSubmitAnswer} disabled={loading} className="mt-3">
                  {loading ? "Evaluating…" : "Submit Answer"}
                </Button>
              </Card>
            )}

            {finished && (
              <Card glass>
                <h3 className="text-lg font-semibold text-accent">Interview Complete 🎉</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Review your feedback above. Aim to improve relevance scores below 70 next round.
                </p>
                <Button onClick={() => setStarted(false)} variant="secondary" className="mt-4">
                  Start Another Interview
                </Button>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
