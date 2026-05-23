import sql from "../client";

export type AnalyticsEvent = "view" | "gate_shown" | "lead_captured";

export interface AnalyticsRow {
  id: string;
  magnet_id: string;
  event: AnalyticsEvent;
  session_id: string | null;
  created_at: string;
}

export interface DailyStat {
  date: string;
  views: number;
  gate_shown: number;
  leads: number;
}

export interface MagnetStats {
  total_views: number;
  total_leads: number;
  total_gate_shown: number;
  conversion_rate: number;
}

export async function trackEvent(data: {
  magnetId: string;
  event: AnalyticsEvent;
  sessionId?: string;
}): Promise<void> {
  await sql`
    INSERT INTO analytics_events (magnet_id, event, session_id)
    VALUES (${data.magnetId}, ${data.event}, ${data.sessionId ?? null})
  `;
}

export async function getMagnetStats(magnetId: string, days?: number): Promise<MagnetStats> {
  const fromDate = days ? new Date(Date.now() - days * 86400000).toISOString() : null;
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE event = 'view')::int as total_views,
      COUNT(*) FILTER (WHERE event = 'lead_captured')::int as total_leads,
      COUNT(*) FILTER (WHERE event = 'gate_shown')::int as total_gate_shown
    FROM analytics_events
    WHERE magnet_id = ${magnetId}
      AND (${fromDate}::text IS NULL OR created_at >= ${fromDate ?? "1970-01-01T00:00:00Z"}::timestamptz)
  `;
  const row = rows[0] as { total_views: number; total_leads: number; total_gate_shown: number };
  const conversionRate = row.total_gate_shown > 0
    ? Math.round((row.total_leads / row.total_gate_shown) * 100)
    : 0;
  return { ...row, conversion_rate: conversionRate };
}

export async function getDailyStats(magnetId: string, days = 30): Promise<DailyStat[]> {
  const fromDate = new Date(Date.now() - days * 86400000).toISOString();
  const rows = await sql`
    SELECT
      DATE(created_at)::text as date,
      COUNT(*) FILTER (WHERE event = 'view')::int as views,
      COUNT(*) FILTER (WHERE event = 'gate_shown')::int as gate_shown,
      COUNT(*) FILTER (WHERE event = 'lead_captured')::int as leads
    FROM analytics_events
    WHERE magnet_id = ${magnetId} AND created_at >= ${fromDate}::timestamptz
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  return rows as DailyStat[];
}
