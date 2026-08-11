import { NextRequest, NextResponse } from "next/server";

// This route runs on the server, so your GEMINI_API_KEY never reaches
// the browser. Set it in Vercel's Environment Variables.

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  const { system, messages } = await req.json();

  // Convert Claude-style messages into Gemini's format
  const contents = (messages || []).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} ${text}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || "";

    // Reshape into the same format the app already expects
    return NextResponse.json({ content: [{ type: "text", text }] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error calling Gemini API" },
      { status: 500 }
    );
  }
}
