import { NextRequest } from "next/server";

/**
 * POST /api/slide-review
 * Returns a signed WebSocket URL for the ElevenLabs Conversational AI agent.
 * The client uses this with the @elevenlabs/client SDK.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return Response.json(
      { error: "ElevenLabs credentials not configured", agentId: null },
      { status: 503 }
    );
  }

  try {
    // Get a signed URL for the WebSocket connection
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(agentId)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "xi-api-key": apiKey },
    });

    if (!res.ok) {
      return Response.json(
        { error: `ElevenLabs API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json({
      signedUrl: data.signed_url,
      agentId,
    });
  } catch {
    return Response.json(
      { error: "Failed to connect to ElevenLabs API" },
      { status: 502 }
    );
  }
}
