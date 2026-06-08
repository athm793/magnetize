import sql from "../client";

export interface Tab {
  id: string;
  magnet_id: string;
  title: string;
  order: number;
  content: unknown[];
  created_at: string;
}

export async function getTabsByMagnet(magnetId: string): Promise<Tab[]> {
  const rows = await sql`
    SELECT * FROM tabs WHERE magnet_id = ${magnetId} ORDER BY "order" ASC
  `;
  return rows as Tab[];
}

export async function createTab(data: {
  magnetId: string;
  title: string;
  order: number;
  content?: unknown[];
}): Promise<Tab> {
  const rows = await sql`
    INSERT INTO tabs (magnet_id, title, "order", content)
    VALUES (${data.magnetId}, ${data.title}, ${data.order}, ${JSON.stringify(data.content ?? [])}::jsonb)
    RETURNING *
  `;
  return rows[0] as Tab;
}

export async function updateTab(
  id: string,
  data: Partial<{ title: string; order: number; content: unknown[] }>,
  magnetId: string
): Promise<Tab | null> {
  const rows = await sql`
    UPDATE tabs SET
      title = COALESCE(${data.title ?? null}, title),
      "order" = COALESCE(${data.order ?? null}, "order"),
      content = CASE WHEN ${data.content !== undefined} THEN ${JSON.stringify(data.content ?? [])}::jsonb ELSE content END
    WHERE id = ${id} AND magnet_id = ${magnetId}
    RETURNING *
  `;
  return (rows[0] as Tab) ?? null;
}

export async function deleteTab(id: string, magnetId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM tabs WHERE id = ${id} AND magnet_id = ${magnetId} RETURNING id`;
  return rows.length > 0;
}

export async function reorderTabs(tabs: { id: string; order: number }[]): Promise<void> {
  if (tabs.length === 0) return;
  await Promise.all(
    tabs.map((tab) => sql`UPDATE tabs SET "order" = ${tab.order} WHERE id = ${tab.id}`)
  );
}
