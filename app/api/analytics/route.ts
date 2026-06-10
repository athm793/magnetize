import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/db/queries/analytics";
import { getMagnetById } from "@/lib/db/queries/magnets";

export async function POST(req: Request) {
  const { magnetId, event, sessionId } = await req.json();
  const VALID_EVENTS = ["view", "gate_shown", "lead_captured"];
  if (!magnetId || !event) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (!VALID_EVENTS.includes(event)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });

  const magnet = await getMagnetById(magnetId);
  if (!magnet || magnet.status !== "published") return NextResponse.json({ error: "Not found" }, { status: 404 });

  await trackEvent({ magnetId, event, sessionId });
  return NextResponse.json({ ok: true });
}
