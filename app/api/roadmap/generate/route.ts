import { NextRequest, NextResponse } from "next/server";
import { openai, MODEL } from "@/lib/openai";

// Expects JSON body: { degree, skills, careerGoal, weakAreas }
export async function POST(req: NextRequest) {
  try {
    const { degree, skills, careerGoal, weakAreas } = await req.json();

    if (!careerGoal) {
      return NextResponse.json({ error: "careerGoal is required." }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a placement preparation coach. Build a personalized roadmap. Respond ONLY with JSON matching: " +
            '{"dailyTasks": string[], "weeklyGoals": string[], "resources": string[], "revisionPlan": string[], "practiceChecklist": string[]}',
        },
        {
          role: "user",
          content: `Degree: ${degree || "not specified"}\nSkills: ${skills || "not specified"}\nCareer goal: ${careerGoal}\nWeak areas: ${weakAreas || "not specified"}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const roadmap = JSON.parse(raw);

    return NextResponse.json({ roadmap });
  } catch (err) {
    console.error("roadmap/generate error:", err);
    return NextResponse.json({ error: "Failed to generate roadmap." }, { status: 500 });
  }
}
