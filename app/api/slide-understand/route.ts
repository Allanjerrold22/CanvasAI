import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import type { SlideData } from "@/lib/slides";

/**
 * POST /api/slide-understand
 *
 * Two modes:
 *  1. PDF mode  — receives { pdfBase64 } and sends the raw PDF to Claude
 *     as a `document` content block so Claude can see text, charts, and visuals.
 *  2. Slide mode — receives { slides } (title + bullets from PPTX parsing)
 *     and sends the text to Claude for enrichment.
 *
 * Returns an array of per-page/slide teaching scripts that the ElevenLabs
 * voice agent uses to explain the deck.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Anthropic API key not configured" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { pdfBase64, slides, pageCount } = body as {
    pdfBase64?: string;
    slides?: SlideData[];
    pageCount?: number;
  };

  if (!pdfBase64 && (!slides || slides.length === 0)) {
    return Response.json(
      { error: "Provide either pdfBase64 or slides" },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  const totalItems = pdfBase64 ? (pageCount ?? 5) : slides!.length;

  const systemPrompt = `You are an expert university lecturer preparing a voiced walkthrough of a presentation for students.

You will receive either a PDF document or slide text. For each page/slide, produce:
1. **teachingScript** – A natural, conversational spoken explanation (60–120 words). Write it as you would say it aloud to a student — clear, engaging, and educational. Don't just re-read the text; connect ideas, add brief context, explain any charts or visuals you see, and build intuition.
2. **keyPoints** – 3–5 short bullet strings (each under 15 words) capturing the most important content on that page, including any data from charts or tables.
3. **title** – A short descriptive title for the page/slide.

Respond with ONLY a valid JSON array (no markdown fences, no commentary):
[
  {
    "pageIndex": 0,
    "title": "...",
    "teachingScript": "...",
    "keyPoints": ["...", "..."]
  }
]

The array must have exactly one object per page/slide, in order. For PDFs, analyze every page including any charts, diagrams, tables, or images you can see.`;

  try {
    // Build the user message content blocks
    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

    if (pdfBase64) {
      // PDF mode: send the actual PDF to Claude using the document content block
      contentBlocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdfBase64,
        },
      });
      contentBlocks.push({
        type: "text",
        text: `This PDF has approximately ${totalItems} pages. Analyze every page — including all text, charts, diagrams, tables, and images. Generate the JSON array with one entry per page.`,
      });
    } else {
      // Slide mode: send the text content
      const deckText = slides!
        .map(
          (s, i) =>
            `Slide ${i + 1}: "${s.title}"\n` +
            s.bullets.map((b) => `  • ${b}`).join("\n")
        )
        .join("\n\n");

      contentBlocks.push({
        type: "text",
        text: `Here is a presentation with ${slides!.length} slides:\n\n${deckText}\n\nGenerate the JSON array with one entry per slide.`,
      });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip potential markdown fences
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed: Array<{
      pageIndex: number;
      title: string;
      teachingScript: string;
      keyPoints: string[];
    }> = JSON.parse(jsonText);

    // Build enriched slides from Claude's analysis
    const enrichedSlides: Array<{
      title: string;
      bullets: string[];
      hasImage: boolean;
      teachingScript: string;
    }> = parsed.map((p, i) => ({
      title: p.title || `Page ${i + 1}`,
      bullets: p.keyPoints.length > 0 ? p.keyPoints : ["(No key points extracted)"],
      hasImage: false,
      teachingScript: p.teachingScript,
    }));

    return Response.json({ enrichedSlides, pageCount: enrichedSlides.length });
  } catch (err) {
    console.error("[slide-understand] Claude error:", err);

    // Graceful fallback
    if (slides) {
      const fallback = slides.map((s) => ({
        ...s,
        teachingScript: `${s.title}. ${s.bullets.join(". ")}`,
      }));
      return Response.json({
        enrichedSlides: fallback,
        pageCount: fallback.length,
        warning: "Claude analysis failed, using raw slide text.",
      });
    }

    return Response.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}