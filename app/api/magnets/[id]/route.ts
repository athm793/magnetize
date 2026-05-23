import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getMagnetById, updateMagnet, deleteMagnet } from "@/lib/db/queries/magnets";
import { getTabsByMagnet, createTab, updateTab, deleteTab, reorderTabs } from "@/lib/db/queries/tabs";
import { getGatesByMagnet, createGate, updateGate, deleteGate } from "@/lib/db/queries/gates";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const magnet = await getMagnetById(id, session.user.id);
  if (!magnet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const tabs = await getTabsByMagnet(id);
  const gates = await getGatesByMagnet(id);
  return NextResponse.json({ magnet, tabs, gates });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  // Handle tab operations
  if (body.action === "createTab") {
    const tabs = await getTabsByMagnet(id);
    const tab = await createTab({ magnetId: id, title: body.title ?? "New Tab", order: tabs.length });
    return NextResponse.json(tab, { status: 201 });
  }
  if (body.action === "updateTab") {
    const tab = await updateTab(body.tabId, { title: body.title, content: body.content, order: body.order });
    return NextResponse.json(tab);
  }
  if (body.action === "deleteTab") {
    await deleteTab(body.tabId);
    return NextResponse.json({ ok: true });
  }
  if (body.action === "reorderTabs") {
    await reorderTabs(body.tabs);
    return NextResponse.json({ ok: true });
  }

  // Handle gate operations
  if (body.action === "createGate") {
    const gate = await createGate({ magnetId: id, type: body.type, triggerConfig: body.triggerConfig, formFields: body.formFields });
    return NextResponse.json(gate, { status: 201 });
  }
  if (body.action === "updateGate") {
    const gate = await updateGate(body.gateId, { type: body.type, triggerConfig: body.triggerConfig, formFields: body.formFields, active: body.active });
    return NextResponse.json(gate);
  }
  if (body.action === "deleteGate") {
    await deleteGate(body.gateId);
    return NextResponse.json({ ok: true });
  }

  // Update magnet itself
  const magnet = await updateMagnet(id, session.user.id, {
    title: body.title,
    status: body.status,
    settings: body.settings,
  });
  if (!magnet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(magnet);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deleted = await deleteMagnet(id, session.user.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
