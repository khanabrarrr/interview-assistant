import { NextRequest, NextResponse } from "next/server";
import { openai, MODEL } from "@/lib/openai";

// Expects JSON body:
// {
//   role: string,            // target job role, e.g. "Frontend Developer"
//   experienceLevel: string, // e.g. "Fresher", "1-3 years"
//   difficulty: string,      // "Easy" | "Medium" | "Hard"
//   interviewType: string,   // "HR" | "Technical" | "Behavioral" | "Project Based" | "Placement Interview"
//   history: { question: string; answer: string }[], // previous Q&A pairs in this session
//   lastAnswer?: string      // the candidate's answer to the most recent question, if any
// }
//
// Returns either the next question, or — if lastAnswer is provided — feedback on
// the previous answer plus the next question.
export async function POST(req: NextRequest) {
  try {
    const { role, experienceLevel, difficulty, interviewType, history, lastAnswer } =
      await req.json();

    if (!role || !interviewType) {
      return NextResponse.json(
        { error: "role and interviewType are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an experienced ${interviewType} interviewer conducting a mock interview for a ${experienceLevel || "candidate"} applying for a ${role} position, at ${difficulty || "Medium"} difficulty.
Ask exactly ONE question at a time. If the candidate just answered a question (see lastAnswer), first evaluate that answer, then ask the next question.
Respond ONLY with JSON matching:
{"feedback": {"evaluation": string, "idealAnswer": string, "betterWording": string, "confidenceScore": number (0-100), "relevanceScore": number (0-100)} | null, "nextQuestion": string, "isFinalQuestion": boolean}
Set "feedback" to null if this is the very first question of the interview (no lastAnswer yet). Keep the interview to a reasonable length; set isFinalQuestion to true once 6-8 questions have been asked.`;

    const historyText = (history || [])
      .map((h: { question: string; answer: string }, i: number) =>
        `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`
      )
      .join("\n\n");

    const userContent = `Interview history so far:\n${historyText || "(none yet — this is the first question)"}\n\nMost recent candidate answer to evaluate (if any): ${lastAnswer || "(none)"}`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(raw);

    return NextResponse.json(result);
  } catch (err) {
    console.error("interview/chat error:", err);
    return NextResponse.json({ error: "Failed to continue interview." }, { status: 500 });
  }
}
