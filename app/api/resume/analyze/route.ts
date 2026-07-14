export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";

// Expects JSON body: { resumeText: string }
// Returns a structured resume analysis (score, ATS score, strengths, etc.)
export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string" || resumeText.length < 30) {
      return NextResponse.json(
        { error: "Please provide extracted resume text (at least 30 characters)." },
        { status: 400 }
      );
    }

    const systemPrompt =
      "You are an expert technical recruiter and resume coach. Analyze the resume text and respond ONLY with a JSON object matching this schema: " +
      '{"resumeScore": number (0-100), "atsScore": number (0-100), "name": string, "skills": string[], "education": string[], "projects": string[], "certifications": string[], "experience": string[], "strengths": string[], "weaknesses": string[], "grammarSuggestions": string[], "missingKeywords": string[], "suggestedImprovements": string[], "summary": string}. ' +
      "Keep each array to at most 6 concise items (a few words to one short sentence each), and keep the summary to 2-3 sentences. Prioritize the most important points over completeness — a shorter, valid response is much more useful than a long one.";

    const analysis = await generateJSON(systemPrompt, resumeText.slice(0, 12000));

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("resume/analyze error:", err);
    return NextResponse.json({ error: "Failed to analyze resume." }, { status: 500 });
  }
}
