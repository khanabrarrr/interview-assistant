export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

// Expects a multipart/form-data POST with a "file" field (.pdf, .docx, or .txt).
// Returns { text: string } with the extracted plain text.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();

    let text = "";

    if (name.endsWith(".pdf")) {
      // Import from the internal lib path, not the package root. pdf-parse's
      // main index.js has debug/test code that misfires when bundled by
      // Next.js serverless functions (it tries to read a nonexistent test
      // file). Importing lib/pdf-parse.js directly skips that broken path.
      const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .pdf, .docx, or .txt file." },
        { status: 400 }
      );
    }

    text = text.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Couldn't extract any text from that file. Try pasting the text manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("resume/extract error:", err);
    return NextResponse.json(
      { error: "Failed to read that file. Try pasting the resume text manually." },
      { status: 500 }
    );
  }
}
