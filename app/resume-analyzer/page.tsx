"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { UploadCloud } from "lucide-react";

interface Analysis {
  resumeScore: number;
  atsScore: number;
  name: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  grammarSuggestions: string[];
  missingKeywords: string[];
  suggestedImprovements: string[];
  summary: string;
}

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  // Uploads the file to /api/resume/extract, which parses PDF/DOCX/TXT
  // server-side (pdf-parse / mammoth) and returns plain text.
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't read that file.");
      setResumeText(data.text);
      toast.success("Resume text extracted!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setExtracting(false);
    }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) {
      toast.error("Paste or upload your resume text first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data.analysis);
      toast.success("Resume analyzed!");
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
        <h1 className="text-2xl font-extrabold">Resume Analyzer</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Upload your resume or paste its text to get an instant AI review.
        </p>

        <Card className="mt-6">
          <label
            htmlFor="resume-upload"
            className="focus-ring flex cursor-pointer flex-col items-center justify-center rounded-xl2 border border-dashed border-white/15 py-10 text-center transition hover:border-accent/50"
          >
            <UploadCloud className="mb-3 text-accent" size={28} />
            <p className="text-sm font-medium">
              {extracting
                ? "Extracting text…"
                : fileName || "Click to upload a .txt/.pdf/.docx resume"}
            </p>
            <p className="mt-1 text-xs text-text-secondary">or paste text below</p>
            <input
              id="resume-upload"
              type="file"
              accept=".txt,.pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here…"
            rows={8}
            className="focus-ring mt-4 w-full rounded-lg border border-white/10 bg-bg-secondary p-4 text-sm text-white outline-none"
          />

          <Button onClick={handleAnalyze} disabled={loading} className="mt-4">
            {loading ? "Analyzing…" : "Analyze Resume"}
          </Button>
        </Card>

        {analysis && (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-text-secondary">Resume Score</p>
                  <p className="text-3xl font-extrabold text-accent">{analysis.resumeScore}/100</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">ATS Score</p>
                  <p className="text-3xl font-extrabold text-accent">{analysis.atsScore}/100</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-text-secondary">{analysis.summary}</p>
            </Card>

            <Card>
              <h3 className="font-semibold">Skills Detected</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.skills?.map((s) => (
                  <span key={s} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                    {s}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-accent">Strengths</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {analysis.strengths?.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </Card>

            <Card>
              <h3 className="font-semibold text-red-400">Weaknesses</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {analysis.weaknesses?.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </Card>

            <Card>
              <h3 className="font-semibold">Missing Keywords</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.missingKeywords?.map((s) => (
                  <span key={s} className="rounded-full bg-white/5 px-3 py-1 text-xs text-text-secondary">
                    {s}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold">Suggested Improvements</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                {analysis.suggestedImprovements?.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
