import { NextResponse } from "next/server";
import { createLead } from "@/lib/db/queries/leads";
import { trackEvent } from "@/lib/db/queries/analytics";
import { getGatesByMagnet } from "@/lib/db/queries/gates";
import { getIntegrationsByMagnet } from "@/lib/db/queries/integrations";
import { getMagnetById } from "@/lib/db/queries/magnets";

async function fireZapierWebhook(webhookUrl: string, payload: Record<string, unknown>) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {}
}

async function appendToGoogleSheets(config: { spreadsheetId: string; sheetName: string; accessToken: string }, row: string[]) {
  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(config.sheetName)}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${config.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] }),
      }
    );
  } catch {}
}

export async function POST(req: Request) {
  const body = await req.json();
  const { magnetId, gateId, email, name, data = {} } = body;

  if (!magnetId || !email) {
    return NextResponse.json({ error: "magnetId and email required" }, { status: 400 });
  }

  const magnet = await getMagnetById(magnetId);
  if (!magnet || magnet.status !== "published") {
    return NextResponse.json({ error: "Magnet not found" }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined;
  const lead = await createLead({ magnetId, gateId, email, name, extraData: data, ip });
  await trackEvent({ magnetId, event: "lead_captured", sessionId: body.sessionId });

  // Fire integrations
  const integrations = await getIntegrationsByMagnet(magnetId);
  for (const integration of integrations.filter((i) => i.active)) {
    if (integration.type === "zapier") {
      const cfg = integration.config as { webhookUrl: string };
      if (cfg.webhookUrl) {
        await fireZapierWebhook(cfg.webhookUrl, { email, name, ...data, magnetId, createdAt: lead.created_at });
      }
    }
    if (integration.type === "google_sheets") {
      const cfg = integration.config as { spreadsheetId: string; sheetName: string; accessToken: string };
      const row = [new Date().toISOString(), email, name ?? "", ...Object.values(data)];
      await appendToGoogleSheets(cfg, row);
    }
  }

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
