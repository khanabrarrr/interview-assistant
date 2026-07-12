import OpenAI from "openai";

// Server-only. Never import this file from a client component —
// it relies on the OPENAI_API_KEY environment variable.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL = "gpt-4o-mini";
