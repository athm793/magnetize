import sql from "../client";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  password_hash: string | null;
  created_at: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  return (rows[0] as User) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  return (rows[0] as User) ?? null;
}

export async function createUser(data: {
  email: string;
  name?: string;
  image?: string;
  password_hash?: string;
}): Promise<User> {
  const rows = await sql`
    INSERT INTO users (email, name, image, password_hash)
    VALUES (${data.email}, ${data.name ?? null}, ${data.image ?? null}, ${data.password_hash ?? null})
    RETURNING *
  `;
  return rows[0] as User;
}

export async function upsertOAuthUser(data: {
  email: string;
  name?: string;
  image?: string;
}): Promise<User> {
  const rows = await sql`
    INSERT INTO users (email, name, image)
    VALUES (${data.email}, ${data.name ?? null}, ${data.image ?? null})
    ON CONFLICT (email) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, users.name),
      image = COALESCE(EXCLUDED.image, users.image)
    RETURNING *
  `;
  return rows[0] as User;
}
