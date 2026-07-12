import { NextRequest, NextResponse } from "next/server";
import { openai, MODEL } from "@/lib/openai";

// Expects JSON body: { answer: string, question?: string }
export async function POST(req: NextRequest) {
  try {
    const { answer, question } = await req.json();

    if (!answer || typeof answer !== "string") {
      return NextResponse.json({ error: "answer is required." }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an interview coach. Improve the candidate's answer. Respond ONLY with JSON matching: " +
            '{"betterAnswer": string, "shortVersion": string, "starVersion": string, "professionalVersion": string, "grammarCorrections": string[], "strongerVocabulary": string[], "missingPoints": string[]}',
        },
        {
          role: "user",
          content: `Interview question: ${question || "(not specified)"}\n\nCandidate's answer: ${answer.slice(0, 4000)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const improved = JSON.parse(raw);

    return NextResponse.json({ improved });
  } catch (err) {
    console.error("answer/improve error:", err);
    return NextResponse.json({ error: "Failed to improve answer." }, { status: 500 });
  }
}
