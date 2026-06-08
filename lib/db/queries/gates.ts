import sql from "../client";

export interface FormField {
  name: string;
  type: "text" | "email" | "tel" | "select";
  required: boolean;
  label: string;
  placeholder?: string;
  options?: string[];
}

export interface TriggerConfig {
  type: "immediate" | "scroll" | "time";
  value?: number;
}

export interface Gate {
  id: string;
  magnet_id: string;
  type: "content_gate" | "popup" | "topbar";
  trigger_config: TriggerConfig;
  form_fields: FormField[];
  active: boolean;
  created_at: string;
}

export async function getGatesByMagnet(magnetId: string): Promise<Gate[]> {
  const rows = await sql`SELECT * FROM gates WHERE magnet_id = ${magnetId}`;
  return rows as Gate[];
}

export async function getGateById(id: string): Promise<Gate | null> {
  const rows = await sql`SELECT * FROM gates WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Gate) ?? null;
}

export async function createGate(data: {
  magnetId: string;
  type: Gate["type"];
  triggerConfig?: TriggerConfig;
  formFields?: FormField[];
}): Promise<Gate> {
  const defaultFields: FormField[] = [
    { name: "email", type: "email", required: true, label: "Email address", placeholder: "you@company.com" }
  ];
  const rows = await sql`
    INSERT INTO gates (magnet_id, type, trigger_config, form_fields)
    VALUES (
      ${data.magnetId},
      ${data.type},
      ${JSON.stringify(data.triggerConfig ?? { type: "immediate" })}::jsonb,
      ${JSON.stringify(data.formFields ?? defaultFields)}::jsonb
    )
    RETURNING *
  `;
  return rows[0] as Gate;
}

export async function updateGate(
  id: string,
  data: Partial<{ type: string; triggerConfig: TriggerConfig; formFields: FormField[]; active: boolean }>,
  magnetId: string
): Promise<Gate | null> {
  const rows = await sql`
    UPDATE gates SET
      type = COALESCE(${data.type ?? null}, type),
      trigger_config = CASE WHEN ${data.triggerConfig !== undefined} THEN ${JSON.stringify(data.triggerConfig ?? {})}::jsonb ELSE trigger_config END,
      form_fields = CASE WHEN ${data.formFields !== undefined} THEN ${JSON.stringify(data.formFields ?? [])}::jsonb ELSE form_fields END,
      active = COALESCE(${data.active ?? null}, active)
    WHERE id = ${id} AND magnet_id = ${magnetId}
    RETURNING *
  `;
  return (rows[0] as Gate) ?? null;
}

export async function deleteGate(id: string, magnetId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM gates WHERE id = ${id} AND magnet_id = ${magnetId} RETURNING id`;
  return rows.length > 0;
}
