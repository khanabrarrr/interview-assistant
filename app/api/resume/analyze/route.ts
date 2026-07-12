import { NextRequest, NextResponse } from "next/server";
import { openai, MODEL } from "@/lib/openai";

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

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical recruiter and resume coach. Analyze the resume text and respond ONLY with a JSON object matching this schema: " +
            '{"resumeScore": number (0-100), "atsScore": number (0-100), "name": string, "skills": string[], "education": string[], "projects": string[], "certifications": string[], "experience": string[], "strengths": string[], "weaknesses": string[], "grammarSuggestions": string[], "missingKeywords": string[], "suggestedImprovements": string[], "summary": string}',
        },
        { role: "user", content: resumeText.slice(0, 12000) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const analysis = JSON.parse(raw);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("resume/analyze error:", err);
    return NextResponse.json({ error: "Failed to analyze resume." }, { status: 500 });
  }
}
