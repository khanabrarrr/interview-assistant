import { GoogleGenerativeAI } from "@google/generative-ai";

// Server-only. Never import this file from a client component —
// it relies on the GEMINI_API_KEY environment variable.
// Get a free key at https://aistudio.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Calls Gemini with a system + user prompt and asks it to return raw JSON,
 * matching the {system, user} -> JSON pattern used across this app's API routes.
 */
export async function generateJSON(systemPrompt: string, userContent: string) {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(userContent);
  const raw = result.response.text();
  return JSON.parse(raw);
}
