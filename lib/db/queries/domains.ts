import sql from "../client";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 16);

export interface Domain {
  id: string;
  user_id: string;
  magnet_id: string | null;
  domain: string;
  txt_record: string;
  verified: boolean;
  created_at: string;
}

export async function getDomainsByUser(userId: string): Promise<Domain[]> {
  const rows = await sql`SELECT * FROM domains WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows as Domain[];
}

export async function getDomainByName(domain: string): Promise<Domain | null> {
  const rows = await sql`SELECT * FROM domains WHERE domain = ${domain} LIMIT 1`;
  return (rows[0] as Domain) ?? null;
}

export async function createDomain(data: {
  userId: string;
  domain: string;
  magnetId?: string;
}): Promise<Domain> {
  const txtRecord = `magnetize-verify=${nanoid()}`;
  const rows = await sql`
    INSERT INTO domains (user_id, magnet_id, domain, txt_record)
    VALUES (${data.userId}, ${data.magnetId ?? null}, ${data.domain}, ${txtRecord})
    RETURNING *
  `;
  return rows[0] as Domain;
}

export async function verifyDomain(id: string): Promise<void> {
  await sql`UPDATE domains SET verified = true WHERE id = ${id}`;
}

export async function updateDomainMagnet(id: string, magnetId: string | null): Promise<void> {
  await sql`UPDATE domains SET magnet_id = ${magnetId} WHERE id = ${id}`;
}

export async function deleteDomain(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM domains WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows.length > 0;
}
