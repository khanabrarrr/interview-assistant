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
 * Retries on rate-limit (429), transient server (503), and malformed/truncated
 * JSON responses — the free tier occasionally throttles, briefly overloads,
 * or (rarely) cuts a response short, and a retry usually gets a clean one.
 */
export async function generateJSON(systemPrompt: string, userContent: string) {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      // Raised from 4096 — long resume analyses (many array fields) were
      // occasionally getting cut off mid-string at the old limit, which
      // produces invalid JSON that fails to parse.
      maxOutputTokens: 8192,
    },
  });

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(userContent);

      const finishReason = result.response.candidates?.[0]?.finishReason;
      if (finishReason === "MAX_TOKENS") {
        // The response was cut off before it finished — parsing it would
        // just fail anyway, so treat this as a retryable failure directly
        // rather than waiting for JSON.parse to throw.
        throw Object.assign(new Error("Response truncated at max output tokens."), {
          retryable: true,
        });
      }

      const raw = result.response.text();
      return JSON.parse(stripCodeFences(raw));
    } catch (err: any) {
      lastError = err;
      const status = err?.status;
      const isJsonError = err instanceof SyntaxError;
      const isRetryable = status === 429 || status === 503 || isJsonError || err?.retryable;

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
