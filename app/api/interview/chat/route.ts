export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";

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

    const questionsAskedSoFar = (history || []).length;

    const systemPrompt = `You are an experienced ${interviewType} interviewer conducting a mock interview for a ${experienceLevel || "candidate"} applying for a ${role} position, at ${difficulty || "Medium"} difficulty.
${questionsAskedSoFar} question(s) have already been asked in this interview (full list is in the history below, in order). Ask exactly ONE new question at a time, and NEVER repeat or closely rephrase a question that already appears in the history.
If the candidate just answered a question (see lastAnswer), first evaluate that specific answer against the question it was given in response to, then ask the next new question.
Respond ONLY with JSON matching:
{"feedback": {"evaluation": string, "idealAnswer": string, "betterWording": string, "confidenceScore": number (0-100), "relevanceScore": number (0-100)} | null, "nextQuestion": string, "isFinalQuestion": boolean}
Set "feedback" to null only if this is the very first question of the interview (no lastAnswer yet). Plan for a total of 6-8 questions in the full interview; set isFinalQuestion to true once that many have been asked and answered — not before question 6.`;

    const historyText = (history || [])
      .map((h: { question: string; answer: string }, i: number) =>
        `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`
      )
      .join("\n\n");

    const userContent = `Interview history so far (${questionsAskedSoFar} question(s) already asked):\n${historyText || "(none yet — this is the first question)"}\n\nMost recent candidate answer to evaluate, in response to the LAST question listed above (if any): ${lastAnswer || "(none — this is the first question, so feedback must be null)"}`;

    const result = await generateJSON(systemPrompt, userContent);

    return NextResponse.json(result);
  } catch (err) {
    console.error("interview/chat error:", err);
    return NextResponse.json({ error: "Failed to continue interview." }, { status: 500 });
  }
}
