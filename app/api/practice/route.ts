import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// POST /api/practice
// body: { mode: "flashcards" | "chat", context: string, message?: string, history?: {role,text}[] }
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { mode, context, message, history = [] } = await req.json();

  // ── FLASHCARD MODE ──────────────────────────────────────────────────────────
  if (mode === "flashcards") {
    // Use responseSchema to force Gemini to return pure JSON — no markdown fences
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id:    { type: SchemaType.STRING },
              front: { type: SchemaType.STRING },
              back:  { type: SchemaType.STRING },
            },
            required: ["id", "front", "back"],
          },
        },
      },
    });

    const prompt = `You are a study assistant. Based on the following content, generate exactly 8 flashcards that test key concepts.

Content:
${context}

Rules:
- front: a question or key term (max 15 words)
- back: the answer or definition (max 40 words)
- id: sequential string "1" through "8"
- Cover the most important concepts
- Do NOT give away answers in the questions
- Make questions that require actual understanding, not just recall`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cards = JSON.parse(text);
      return Response.json({ cards });
    } catch (err: unknown) {
      console.error("Flashcard generation error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota = msg.includes("429") || msg.includes("Quota") || msg.includes("quota");
      return Response.json(
        { error: isQuota
            ? "API quota exceeded. Please wait a minute and try again."
            : "Failed to generate flashcards. Please try again." },
        { status: 500 }
      );
    }
  }

  // ── CHAT / SOCRATIC TUTOR MODE ──────────────────────────────────────────────
  if (mode === "chat") {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `You are Sparky, a Socratic study tutor helping a university student understand their coursework.

Your role:
- Help the student UNDERSTAND concepts, not just get answers
- Ask guiding questions to lead them to the answer themselves
- Break down complex ideas into smaller steps
- Encourage and support without being condescending
- If they ask for a direct answer, redirect with a hint or a guiding question instead
- You can confirm if their reasoning is correct or point out where it goes wrong

STRICT RULES:
- NEVER directly solve homework problems or write assignment answers for them
- NEVER write code that directly solves their assignment
- NEVER give away the final answer — guide them to it
- If they ask you to "just give the answer", say you can't but offer a stronger hint
- Keep responses concise (2-4 sentences max unless explaining a concept)

Context about what they're studying:
${context}`;

    const chat = model.startChat({
      systemInstruction,
      history: history.map((h: { role: string; text: string }) => ({
        role: h.role === "sparky" ? "model" : "user",
        parts: [{ text: h.text }],
      })),
    });

    const stream = await chat.sendMessageStream(message ?? "");

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  return Response.json({ error: "Invalid mode" }, { status: 400 });
}
