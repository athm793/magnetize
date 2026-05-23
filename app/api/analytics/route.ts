import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/db/queries/analytics";
import { getMagnetById } from "@/lib/db/queries/magnets";

export async function POST(req: Request) {
  const { magnetId, event, sessionId } = await req.json();
  if (!magnetId || !event) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const magnet = await getMagnetById(magnetId);
  if (!magnet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await trackEvent({ magnetId, event, sessionId });
  return NextResponse.json({ ok: true });
}
