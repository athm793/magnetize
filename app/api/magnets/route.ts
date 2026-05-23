import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getMagnetsByUser, createMagnet } from "@/lib/db/queries/magnets";
import { createTab } from "@/lib/db/queries/tabs";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const magnets = await getMagnetsByUser(session.user.id);
  return NextResponse.json(magnets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title = "Untitled Lead Magnet" } = await req.json().catch(() => ({}));
  const slug = generateSlug(title);
  const magnet = await createMagnet({ userId: session.user.id, title, slug });
  await createTab({ magnetId: magnet.id, title: "Introduction", order: 0 });
  return NextResponse.json(magnet, { status: 201 });
}
