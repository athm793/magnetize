import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getDomainsByUser, createDomain, deleteDomain, verifyDomain, updateDomainMagnet } from "@/lib/db/queries/domains";
import { getMagnetById } from "@/lib/db/queries/magnets";
import dns from "dns/promises";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const domains = await getDomainsByUser(session.user.id);
  return NextResponse.json(domains);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { domain, magnetId } = await req.json();
  if (!domain) return NextResponse.json({ error: "domain required" }, { status: 400 });
  try {
    const created = await createDomain({ userId: session.user.id, domain, magnetId });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Domain already registered" }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, action, magnetId } = await req.json();

  if (action === "verify") {
    const domains = await getDomainsByUser(session.user.id);
    const domain = domains.find((d) => d.id === id);
    if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });
    try {
      const records = await dns.resolveTxt(domain.domain);
      const flat = records.flat();
      if (flat.some((r) => r === domain.txt_record)) {
        await verifyDomain(id);
        return NextResponse.json({ verified: true });
      }
    } catch {}
    return NextResponse.json({ verified: false });
  }

  if (action === "assignMagnet") {
    // Verify domain ownership
    const domains = await getDomainsByUser(session.user.id);
    const domain = domains.find((d) => d.id === id);
    if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Verify magnet ownership if one is being assigned
    if (magnetId) {
      const magnet = await getMagnetById(magnetId, session.user.id);
      if (!magnet) return NextResponse.json({ error: "Magnet not found" }, { status: 404 });
    }
    await updateDomainMagnet(id, magnetId ?? null);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const deleted = await deleteDomain(id, session.user.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
