import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/db/queries/users";

export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const existing = await getUserByEmail(email);
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const password_hash = await bcrypt.hash(password, 12);
  await createUser({ email, name, password_hash });
  return NextResponse.json({ ok: true }, { status: 201 });
}
