import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getMagnetsByUser, createMagnet } from "@/lib/db/queries/magnets";
import { createTab } from "@/lib/db/queries/tabs";
import { generateSlug } from "@/lib/slug";
import { getTemplate } from "@/lib/templates";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const magnets = await getMagnetsByUser(session.user.id);
  return NextResponse.json(magnets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title = "Untitled Lead Magnet", templateId } = await req.json().catch(() => ({}));
  const slug = generateSlug(title);
  const magnet = await createMagnet({ userId: session.user.id, title, slug });

  const template = templateId ? getTemplate(templateId) : null;
  if (template && template.tabs.length > 0) {
    for (let i = 0; i < template.tabs.length; i++) {
      await createTab({
        magnetId: magnet.id,
        title: template.tabs[i].title,
        order: i,
        content: template.tabs[i].content as unknown[],
      });
    }
  } else {
    await createTab({ magnetId: magnet.id, title: "Introduction", order: 0 });
  }

  return NextResponse.json(magnet, { status: 201 });
}
