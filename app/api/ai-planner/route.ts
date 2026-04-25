import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { title, description, dueDate } = await req.json();

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are an expert academic planning assistant helping a university student break down an assignment into a structured study plan.

When given an assignment, you will:
1. First, think through the assignment carefully — analyze what's required, estimate the complexity, and reason about how to approach it. Write this reasoning in a clear, encouraging tone (2-3 paragraphs).
2. Then output exactly 2-3 plan options as a JSON array between the delimiters ---PLANS_START--- and ---PLANS_END---

Each plan should have a different pacing style:
- "Steady Pace": evenly distributed milestones
- "Sprint Mode": front-loaded work with buffer at the end  
- "Balanced": a mix with a mid-point review

The JSON must follow this exact schema:
[
  {
    "id": "plan-1",
    "name": "Steady Pace",
    "milestoneCount": 4,
    "estimatedCompletion": "YYYY-MM-DD",
    "milestones": [
      { "id": "m1-1", "title": "Short milestone title", "targetDate": "YYYY-MM-DD" }
    ]
  }
]

Keep milestone titles under 20 characters. Use ISO date strings. Today's date context: ${new Date().toISOString().split("T")[0]}.`;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1500,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Assignment: ${title}\nDue: ${dueDate}\n\nDescription: ${description || "No description provided."}`,
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
