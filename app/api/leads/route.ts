import { NextResponse } from "next/server";
import { createLead } from "@/lib/db/queries/leads";
import { trackEvent } from "@/lib/db/queries/analytics";
import { getGatesByMagnet } from "@/lib/db/queries/gates";
import { getIntegrationsByMagnet, updateIntegrationConfig, type GoogleSheetsConfig } from "@/lib/db/queries/integrations";
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

async function appendToGoogleSheets(integrationId: string, config: GoogleSheetsConfig, row: string[]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(config.sheetName)}:append?valueInputOption=USER_ENTERED`;
  const requestBody = JSON.stringify({ values: [row] });

  const doAppend = (token: string) =>
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: requestBody,
    });

  try {
    let res = await doAppend(config.accessToken);

    if (res.status === 401 && config.refreshToken) {
      // Access token expired — use the refresh token to get a new one
      const { OAuth2Client } = await import("google-auth-library");
      const oauth2 = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2.setCredentials({ refresh_token: config.refreshToken });
      const { credentials } = await oauth2.refreshAccessToken();
      const newAccessToken = credentials.access_token;
      if (!newAccessToken) return;

      // Persist the new token so future calls don't repeat the refresh
      const updatedConfig: GoogleSheetsConfig = { ...config, accessToken: newAccessToken };
      await updateIntegrationConfig(integrationId, updatedConfig);

      // Retry with fresh token
      res = await doAppend(newAccessToken);
    }
  } catch {
    // Integration failures must not block lead capture
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json();
  const { magnetId, gateId, email, name, data = {} } = body;

  if (!magnetId || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid magnetId and email required" }, { status: 400 });
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
      const cfg = integration.config as GoogleSheetsConfig;
      const row = [new Date().toISOString(), email, name ?? "", ...Object.values(data)];
      await appendToGoogleSheets(integration.id, cfg, row);
    }
  }

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
