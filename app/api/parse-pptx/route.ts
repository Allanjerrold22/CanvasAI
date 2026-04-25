import { NextRequest } from "next/server";
import JSZip from "jszip";

/**
 * POST /api/parse-pptx
 * Accepts a PPTX or PDF file upload, extracts slide/page text content,
 * and returns slide data for the reviewer.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      return handlePdf(file);
    }

    if (ext === "pptx" || ext === "ppt") {
      return handlePptx(file);
    }

    return Response.json(
      { error: "Only PPTX, PPT, and PDF files are supported" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Parse error:", err);
    return Response.json(
      { error: "Failed to parse the file" },
      { status: 500 }
    );
  }
}

// ── PPTX parsing ──

/**
 * Extract paragraphs from a PPTX slide XML.
 * Groups <a:t> text runs by their parent <a:p> paragraph,
 * so "Hello " + "World" in the same paragraph becomes "Hello World".
 */
function extractParagraphs(xml: string): string[] {
  const paragraphs: string[] = [];

  // Match each <a:p>...</a:p> block
  const pRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
  let pMatch;

  while ((pMatch = pRegex.exec(xml)) !== null) {
    const pContent = pMatch[1];

    // Collect all <a:t> text within this paragraph
    const tRegex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
    let tMatch;
    let paragraphText = "";

    while ((tMatch = tRegex.exec(pContent)) !== null) {
      paragraphText += tMatch[1];
    }

    const trimmed = paragraphText.trim();
    if (trimmed.length > 0) {
      paragraphs.push(trimmed);
    }
  }

  return paragraphs;
}

/**
 * Determine which paragraphs are in the title shape vs body shapes.
 * In PPTX, title shapes have type="title" or type="ctrTitle" in the
 * <p:sp> → <p:nvSpPr> → <p:nvPr> → <p:ph> element.
 */
function extractTitleAndBody(xml: string): { title: string; body: string[] } {
  // Try to find title placeholder text
  const titleShapeRegex =
    /<p:sp\b[^>]*>[\s\S]*?<p:ph[^>]*type="(?:title|ctrTitle)"[^>]*\/>[\s\S]*?<p:txBody>([\s\S]*?)<\/p:txBody>[\s\S]*?<\/p:sp>/gi;
  const titleMatch = titleShapeRegex.exec(xml);

  let title = "";
  if (titleMatch) {
    const titleParagraphs = extractParagraphs(titleMatch[1]);
    title = titleParagraphs.join(" ");
  }

  // Extract all paragraphs from the entire slide
  const allParagraphs = extractParagraphs(xml);

  // Body = all paragraphs except the title
  const body = allParagraphs.filter((p) => p !== title && p.length > 1);

  // If no title found via placeholder, use the first paragraph
  if (!title && allParagraphs.length > 0) {
    title = allParagraphs[0];
  }

  return { title, body };
}

async function handlePptx(file: File) {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] ?? "0");
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] ?? "0");
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    return Response.json(
      { error: "No slides found in the file" },
      { status: 400 }
    );
  }

  const slides = [];

  for (const slidePath of slideFiles) {
    const xml = await zip.files[slidePath].async("string");

    const { title, body } = extractTitleAndBody(xml);
    const hasImage = xml.includes("<p:pic") || xml.includes("<a:blip");

    slides.push({
      title: title || `Slide ${slides.length + 1}`,
      bullets:
        body.length > 0 ? body : ["(No text content on this slide)"],
      hasImage,
    });
  }

  return Response.json({ slides, fileName: file.name });
}

// ── PDF parsing ──

async function handlePdf(file: File) {
  // For PDF files, we extract text page by page.
  // Since we can't use pdf.js on the server easily (it needs canvas),
  // we'll do a simpler approach: extract raw text from the PDF binary.
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = extractPdfText(bytes);

  // Split into pages by form feed or by rough text chunks
  const pages = text
    .split(/\f/) // Form feed character separates pages in many PDFs
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (pages.length === 0) {
    // If no form feeds, split by rough paragraph chunks
    const chunks = text.split(/\n{3,}/);
    const slidesFromChunks = chunks
      .filter((c) => c.trim().length > 10)
      .map((chunk, i) => {
        const lines = chunk
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);
        return {
          title: lines[0] || `Page ${i + 1}`,
          bullets:
            lines.length > 1
              ? lines.slice(1)
              : ["(No additional text on this page)"],
          hasImage: false,
        };
      });

    if (slidesFromChunks.length === 0) {
      return Response.json({
        slides: [
          {
            title: file.name.replace(/\.pdf$/i, ""),
            bullets: [
              text.slice(0, 500) || "(Could not extract text from this PDF)",
            ],
            hasImage: false,
          },
        ],
        fileName: file.name,
      });
    }

    return Response.json({ slides: slidesFromChunks, fileName: file.name });
  }

  const slides = pages.map((page, i) => {
    const lines = page
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return {
      title: lines[0] || `Page ${i + 1}`,
      bullets:
        lines.length > 1
          ? lines.slice(1).slice(0, 10) // Cap at 10 bullets per page
          : ["(No additional text on this page)"],
      hasImage: false,
    };
  });

  return Response.json({ slides, fileName: file.name });
}

/**
 * Basic PDF text extraction — reads text objects from the PDF binary.
 * This is a simplified parser that handles common PDF text encodings.
 */
function extractPdfText(bytes: Uint8Array): string {
  const str = new TextDecoder("latin1").decode(bytes);
  const textParts: string[] = [];

  // Match text between BT (begin text) and ET (end text) operators
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let btMatch;

  while ((btMatch = btEtRegex.exec(str)) !== null) {
    const block = btMatch[1];

    // Extract text from Tj, TJ, ', and " operators
    // Tj: (text) Tj
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(decodePdfString(tjMatch[1]));
    }

    // TJ: [(text) num (text) ...] TJ
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/gi;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = tjArrMatch[1];
      const innerRegex = /\(([^)]*)\)/g;
      let innerMatch;
      let line = "";
      while ((innerMatch = innerRegex.exec(inner)) !== null) {
        line += decodePdfString(innerMatch[1]);
      }
      if (line.trim()) textParts.push(line);
    }
  }

  return textParts.join("\n");
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}
