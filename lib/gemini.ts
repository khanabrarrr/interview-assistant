import { GoogleGenerativeAI } from "@google/generative-ai";

// Server-only. Never import this file from a client component —
// it relies on the GEMINI_API_KEY environment variable.
// Get a free key at https://aistudio.google.com/app/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model names in the Gemini lineup change fairly often as Google retires
// older versions. If this model starts returning 404 "no longer available"
// errors, check https://ai.google.dev/gemini-api/docs/models for the current
// generally-available Flash model name and swap it in here.
export const GEMINI_MODEL = "gemini-3.5-flash";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini's JSON mode is very reliable but not 100% guaranteed to return
// clean JSON with zero surrounding text — this strips stray markdown code
// fences (```json ... ```) some responses occasionally include.
function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

/**
 * Calls Gemini with a system + user prompt and asks it to return raw JSON,
 * matching the {system, user} -> JSON pattern used across this app's API routes.
 * Retries on rate-limit (429) and transient server (503) errors, since the
 * free tier occasionally throttles or briefly overloads under load.
 */
export async function generateJSON(systemPrompt: string, userContent: string) {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
    },
  });

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(userContent);
      const raw = result.response.text();
      return JSON.parse(stripCodeFences(raw));
    } catch (err: any) {
      lastError = err;
      const status = err?.status;
      const isRetryable = status === 429 || status === 503;

      console.error(
        `Gemini generateJSON failed (attempt ${attempt}/${maxAttempts}, status ${status}):`,
        err?.message || err
      );

      if (isRetryable && attempt < maxAttempts) {
        // Back off a bit longer each retry (1.5s, 3s) to ride out brief
        // rate-limit/overload windows on the free tier.
        await sleep(1500 * attempt);
        continue;
      }
      break;
    }
  }

  throw lastError;
}
