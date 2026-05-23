import sql from "../client";

export interface Lead {
  id: string;
  magnet_id: string;
  gate_id: string | null;
  email: string;
  name: string | null;
  data: Record<string, string>;
  ip: string | null;
  created_at: string;
}

export async function createLead(data: {
  magnetId: string;
  gateId?: string;
  email: string;
  name?: string;
  extraData?: Record<string, string>;
  ip?: string;
}): Promise<Lead> {
  const rows = await sql`
    INSERT INTO leads (magnet_id, gate_id, email, name, data, ip)
    VALUES (
      ${data.magnetId},
      ${data.gateId ?? null},
      ${data.email},
      ${data.name ?? null},
      ${JSON.stringify(data.extraData ?? {})}::jsonb,
      ${data.ip ?? null}
    )
    RETURNING *
  `;
  return rows[0] as Lead;
}

export async function getLeadsByMagnet(
  magnetId: string,
  opts?: { limit?: number; offset?: number; search?: string; from?: string; to?: string }
): Promise<Lead[]> {
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;
  const rows = await sql`
    SELECT * FROM leads
    WHERE magnet_id = ${magnetId}
      AND (${opts?.search ?? null}::text IS NULL OR email ILIKE ${"%" + (opts?.search ?? "") + "%"} OR name ILIKE ${"%" + (opts?.search ?? "") + "%"})
      AND (${opts?.from ?? null}::text IS NULL OR created_at >= ${opts?.from ?? "1970-01-01"}::timestamptz)
      AND (${opts?.to ?? null}::text IS NULL OR created_at <= ${opts?.to ?? "9999-12-31"}::timestamptz)
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as Lead[];
}

export async function countLeadsByMagnet(magnetId: string): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int as count FROM leads WHERE magnet_id = ${magnetId}`;
  return (rows[0] as { count: number }).count;
}

export async function checkLeadExists(magnetId: string, email: string): Promise<boolean> {
  const rows = await sql`
    SELECT id FROM leads WHERE magnet_id = ${magnetId} AND email = ${email} LIMIT 1
  `;
  return rows.length > 0;
}
