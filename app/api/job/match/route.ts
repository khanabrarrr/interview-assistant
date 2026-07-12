import { NextRequest, NextResponse } from "next/server";
import { openai, MODEL } from "@/lib/openai";

// Expects JSON body: { resumeText: string, jobDescription: string }
export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Both resumeText and jobDescription are required." },
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
            "You compare a resume against a job description. Respond ONLY with JSON matching: " +
            '{"matchPercentage": number (0-100), "matchingSkills": string[], "missingSkills": string[], "atsCompatibility": number (0-100), "suggestedResumeChanges": string[], "importantKeywords": string[], "skillsToLearn": string[]}',
        },
        {
          role: "user",
          content: `RESUME:\n${resumeText.slice(0, 8000)}\n\nJOB DESCRIPTION:\n${jobDescription.slice(0, 4000)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const match = JSON.parse(raw);

    return NextResponse.json({ match });
  } catch (err) {
    console.error("job/match error:", err);
    return NextResponse.json({ error: "Failed to match job description." }, { status: 500 });
  }
}
