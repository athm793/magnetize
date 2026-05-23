import sql from "../client";

export interface ZapierConfig {
  webhookUrl: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  accessToken: string;
  refreshToken: string;
}

export interface Rb2bConfig {
  pixelId: string;
}

export type IntegrationConfig = ZapierConfig | GoogleSheetsConfig | Rb2bConfig;

export interface Integration {
  id: string;
  magnet_id: string;
  type: "zapier" | "google_sheets" | "rb2b";
  config: IntegrationConfig;
  active: boolean;
  created_at: string;
}

export async function getIntegrationsByMagnet(magnetId: string): Promise<Integration[]> {
  const rows = await sql`SELECT * FROM integrations WHERE magnet_id = ${magnetId}`;
  return rows as Integration[];
}

export async function upsertIntegration(data: {
  magnetId: string;
  type: Integration["type"];
  config: IntegrationConfig;
}): Promise<Integration> {
  const rows = await sql`
    INSERT INTO integrations (magnet_id, type, config)
    VALUES (${data.magnetId}, ${data.type}, ${JSON.stringify(data.config)}::jsonb)
    ON CONFLICT (magnet_id, type) DO UPDATE SET
      config = EXCLUDED.config,
      active = true
    RETURNING *
  `;
  return rows[0] as Integration;
}

export async function toggleIntegration(id: string, active: boolean): Promise<void> {
  await sql`UPDATE integrations SET active = ${active} WHERE id = ${id}`;
}

export async function deleteIntegration(id: string): Promise<void> {
  await sql`DELETE FROM integrations WHERE id = ${id}`;
}
