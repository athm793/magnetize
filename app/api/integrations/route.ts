import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getIntegrationsByMagnet, upsertIntegration, toggleIntegration, deleteIntegration } from "@/lib/db/queries/integrations";
import { getMagnetById } from "@/lib/db/queries/magnets";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const magnetId = searchParams.get("magnetId");
  if (!magnetId) return NextResponse.json({ error: "magnetId required" }, { status: 400 });
  const magnet = await getMagnetById(magnetId, session.user.id);
  if (!magnet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const integrations = await getIntegrationsByMagnet(magnetId);
  return NextResponse.json(integrations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { magnetId, type, config } = await req.json();
  if (!magnetId || !type || !config) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const magnet = await getMagnetById(magnetId, session.user.id);
  if (!magnet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const integration = await upsertIntegration({ magnetId, type, config });
  return NextResponse.json(integration, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, active } = await req.json();
  const ok = await toggleIntegration(id, active, session.user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const ok = await deleteIntegration(id, session.user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
