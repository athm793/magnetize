import sql from "../client";

export interface MagnetSettings {
  primaryColor?: string;
  bgColor?: string;
  accentColor?: string;
  logo?: string;
  seoTitle?: string;
  seoDescription?: string;
  rb2bPixelId?: string;
}

export interface LeadMagnet {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  settings: MagnetSettings;
  created_at: string;
  updated_at: string;
}

export async function getMagnetsByUser(userId: string): Promise<LeadMagnet[]> {
  const rows = await sql`
    SELECT * FROM lead_magnets WHERE user_id = ${userId} ORDER BY updated_at DESC
  `;
  return rows as LeadMagnet[];
}

export async function getMagnetById(id: string, userId?: string): Promise<LeadMagnet | null> {
  if (userId) {
    const rows = await sql`SELECT * FROM lead_magnets WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
    return (rows[0] as LeadMagnet) ?? null;
  }
  const rows = await sql`SELECT * FROM lead_magnets WHERE id = ${id} LIMIT 1`;
  return (rows[0] as LeadMagnet) ?? null;
}

export async function getMagnetBySlug(slug: string): Promise<LeadMagnet | null> {
  const rows = await sql`
    SELECT * FROM lead_magnets WHERE slug = ${slug} AND status = 'published' LIMIT 1
  `;
  return (rows[0] as LeadMagnet) ?? null;
}

export async function createMagnet(data: {
  userId: string;
  title: string;
  slug: string;
}): Promise<LeadMagnet> {
  const rows = await sql`
    INSERT INTO lead_magnets (user_id, title, slug)
    VALUES (${data.userId}, ${data.title}, ${data.slug})
    RETURNING *
  `;
  return rows[0] as LeadMagnet;
}

export async function updateMagnet(
  id: string,
  userId: string,
  data: Partial<{ title: string; status: string; settings: MagnetSettings }>
): Promise<LeadMagnet | null> {
  const rows = await sql`
    UPDATE lead_magnets
    SET
      title = COALESCE(${data.title ?? null}, title),
      status = COALESCE(${data.status ?? null}, status),
      settings = CASE WHEN ${data.settings !== undefined} THEN ${JSON.stringify(data.settings ?? {})}::jsonb ELSE settings END,
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `;
  return (rows[0] as LeadMagnet) ?? null;
}

export async function deleteMagnet(id: string, userId: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM lead_magnets WHERE id = ${id} AND user_id = ${userId} RETURNING id
  `;
  return rows.length > 0;
}

export async function countMagnetsByUser(userId: string): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int as count FROM lead_magnets WHERE user_id = ${userId}`;
  return (rows[0] as { count: number }).count;
}

export async function getMagnetByDomain(domain: string): Promise<LeadMagnet | null> {
  const rows = await sql`
    SELECT lm.* FROM lead_magnets lm
    JOIN domains d ON d.magnet_id = lm.id
    WHERE d.domain = ${domain} AND d.verified = true AND lm.status = 'published'
    LIMIT 1
  `;
  return (rows[0] as LeadMagnet) ?? null;
}
