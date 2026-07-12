import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";

// Expects JSON body: { degree, skills, careerGoal, weakAreas }
export async function POST(req: NextRequest) {
  try {
    const { degree, skills, careerGoal, weakAreas } = await req.json();

    if (!careerGoal) {
      return NextResponse.json({ error: "careerGoal is required." }, { status: 400 });
    }

    const systemPrompt =
      "You are a placement preparation coach. Build a personalized roadmap. Respond ONLY with JSON matching: " +
      '{"dailyTasks": string[], "weeklyGoals": string[], "resources": string[], "revisionPlan": string[], "practiceChecklist": string[]}';

    const userContent = `Degree: ${degree || "not specified"}\nSkills: ${skills || "not specified"}\nCareer goal: ${careerGoal}\nWeak areas: ${weakAreas || "not specified"}`;

    const roadmap = await generateJSON(systemPrompt, userContent);

    return NextResponse.json({ roadmap });
  } catch (err) {
    console.error("roadmap/generate error:", err);
    return NextResponse.json({ error: "Failed to generate roadmap." }, { status: 500 });
  }
}
