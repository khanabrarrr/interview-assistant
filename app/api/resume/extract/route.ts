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
      text = await extractPdfText(buffer);
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

// Uses pdfjs-dist (Mozilla's actively maintained PDF engine, the same one
// Firefox uses) rather than the unmaintained pdf-parse package, which fails
// on many modern PDFs due to an outdated bundled parser.
async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    text += pageText + "\n";
  }

  return text;
}
