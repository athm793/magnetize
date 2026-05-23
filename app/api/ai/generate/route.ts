import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { hasAI, generateMagnetContent } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasAI) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const { topic, audience } = await req.json();
  if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const tabs = await generateMagnetContent(topic, audience ?? "professionals", (chunk) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, tabs })}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
