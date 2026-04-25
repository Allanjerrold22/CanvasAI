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
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = new TextDecoder("latin1").decode(bytes);

  // Count pages by looking for /Type /Page objects (not /Pages)
  // This regex matches "/Type /Page" but not "/Type /Pages"
  const pageMatches = text.match(/\/Type\s*\/Page(?!s)\b/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  // Extract text per page using page stream boundaries
  // PDFs have "endstream" markers between content streams
  const slides = [];

  // Try to extract text from BT/ET blocks and group by rough position in file
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  const allTextBlocks: string[] = [];
  let btMatch;

  while ((btMatch = btEtRegex.exec(text)) !== null) {
    const block = btMatch[1];
    const parts: string[] = [];

    // Tj operator
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const decoded = tjMatch[1]
        .replace(/\\n/g, "\n").replace(/\\r/g, "")
        .replace(/\\\(/g, "(").replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
      if (decoded.trim()) parts.push(decoded.trim());
    }

    // TJ array operator
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/gi;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = tjArrMatch[1];
      const innerRegex = /\(([^)]*)\)/g;
      let innerMatch;
      let line = "";
      while ((innerMatch = innerRegex.exec(inner)) !== null) {
        line += innerMatch[1]
          .replace(/\\n/g, "\n").replace(/\\r/g, "")
          .replace(/\\\(/g, "(").replace(/\\\)/g, ")")
          .replace(/\\\\/g, "\\");
      }
      if (line.trim()) parts.push(line.trim());
    }

    if (parts.length > 0) {
      allTextBlocks.push(parts.join(" "));
    }
  }

  if (allTextBlocks.length > 0 && pageCount > 0) {
    // Distribute text blocks roughly across pages
    const blocksPerPage = Math.max(1, Math.ceil(allTextBlocks.length / pageCount));

    for (let i = 0; i < pageCount; i++) {
      const start = i * blocksPerPage;
      const end = Math.min(start + blocksPerPage, allTextBlocks.length);
      const pageBlocks = allTextBlocks.slice(start, end);

      if (pageBlocks.length > 0) {
        slides.push({
          title: pageBlocks[0].slice(0, 80) || `Page ${i + 1}`,
          bullets: pageBlocks.length > 1
            ? pageBlocks.slice(1).slice(0, 10)
            : ["(Visual content on this page)"],
          hasImage: false,
        });
      } else {
        slides.push({
          title: `Page ${i + 1}`,
          bullets: ["(Visual content on this page)"],
          hasImage: false,
        });
      }
    }
  } else {
    // Couldn't extract text — create placeholder slides for each page
    for (let i = 0; i < pageCount; i++) {
      slides.push({
        title: `Page ${i + 1}`,
        bullets: ["(Visual/image content — text not extractable)"],
        hasImage: true,
      });
    }
  }

  return Response.json({ slides, fileName: file.name, pageCount });
}
